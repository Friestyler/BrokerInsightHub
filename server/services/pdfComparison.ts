import { readFile } from 'fs/promises';
import path from 'path';
// pdf-parse is a default export
import pdfParse from 'pdf-parse';

export interface DocumentDifference {
  type: 'added' | 'removed' | 'modified';
  section: string;
  description: string;
}

export interface ComparisonResult {
  addedClauses: number;
  removedClauses: number;
  modifiedClauses: number;
  details: DocumentDifference[];
}

/**
 * Extracts text from a PDF file
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
  try {
    const dataBuffer = await readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error: any) {
    console.error(`Error extracting text from PDF: ${error}`);
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Split PDF text into sections/paragraphs
 */
function splitIntoSections(text: string): string[] {
  // First try to split by double newlines which often indicate paragraph breaks
  let sections = text.split(/\n\s*\n/);
  
  // If we have very few sections, try to split by single newlines
  if (sections.length < 5) {
    sections = text.split(/\n/);
  }
  
  // If we still have few sections, try to split into sentences
  if (sections.length < 10) {
    const allSections: string[] = [];
    sections.forEach(section => {
      // Split by period followed by space or newline
      const sentences = section.split(/\.\s+|\.\n+/);
      sentences.forEach(sentence => {
        if (sentence.trim().length > 0) {
          allSections.push(sentence.trim() + '.');
        }
      });
    });
    sections = allSections;
  }
  
  // Filter out empty sections and trim whitespace
  return sections
    .map(section => section.trim())
    .filter(section => section.length > 0);
}

/**
 * Calculate similarity between two strings (0-1)
 * Using Levenshtein distance approach
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;
  
  // Simple character-based difference for now
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  // Calculate Levenshtein distance
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create a matrix of size (m+1) x (n+1)
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Fill the first row and column
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  // Fill the rest of the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,     // deletion
        dp[i][j - 1] + 1,     // insertion
        dp[i - 1][j - 1] + cost  // substitution
      );
    }
  }
  
  return dp[m][n];
}

/**
 * Identify modified sections between two documents
 */
function identifyModifiedSections(
  oldSections: string[],
  newSections: string[],
  similarityThreshold = 0.65 // Lower threshold to detect more subtle differences
): { modifiedPairs: [string, string][]; onlyInOld: string[]; onlyInNew: string[] } {
  const modifiedPairs: [string, string][] = [];
  const usedOldIndices = new Set<number>();
  const usedNewIndices = new Set<number>();
  
  // Find modified pairs (similar but not identical sections)
  for (let i = 0; i < oldSections.length; i++) {
    for (let j = 0; j < newSections.length; j++) {
      if (usedNewIndices.has(j)) continue;
      
      const similarity = calculateSimilarity(oldSections[i], newSections[j]);
      
      // If sections are similar but not identical, consider them as a modified pair
      if (similarity >= similarityThreshold && similarity < 1.0) {
        modifiedPairs.push([oldSections[i], newSections[j]]);
        usedOldIndices.add(i);
        usedNewIndices.add(j);
        break;
      }
      
      // If sections are identical, mark them as used but don't include in the result
      if (similarity === 1.0) {
        usedOldIndices.add(i);
        usedNewIndices.add(j);
        break;
      }
    }
  }
  
  // Find sections that are only in the old document
  const onlyInOld = oldSections.filter((_, index) => !usedOldIndices.has(index));
  
  // Find sections that are only in the new document
  const onlyInNew = newSections.filter((_, index) => !usedNewIndices.has(index));
  
  return { modifiedPairs, onlyInOld, onlyInNew };
}

/**
 * Compare options for PDF comparison
 */
export interface ComparisonOptions {
  mode?: 'policy' | 'template';
  additionalFiles?: string[];
}

/**
 * Compare PDF documents and return the differences
 */
export async function comparePdfDocuments(
  doc1Path: string,
  doc2Path: string,
  options: ComparisonOptions = {}
): Promise<ComparisonResult> {
  try {
    const { mode = 'policy', additionalFiles = [] } = options;
    
    // Extract text from the main documents
    const doc1Text = await extractTextFromPdf(doc1Path);
    const doc2Text = await extractTextFromPdf(doc2Path);
    
    // Also extract text from additional documents if provided
    const additionalTexts = await Promise.all(
      additionalFiles.map(filePath => extractTextFromPdf(filePath))
    );
    
    // If we're in template checking mode
    if (mode === 'template') {
      return compareTemplateCompletion(doc1Text, doc2Text);
    }
    
    // If we have additional files, it's a multi-policy comparison
    if (additionalTexts.length > 0) {
      return compareMultiplePolicies(doc1Text, doc2Text, additionalTexts);
    }
    
    // Standard policy comparison (two documents)
    return compareTwoPolicies(doc1Text, doc2Text);
  } catch (error) {
    console.error(`Error comparing PDF documents: ${error}`);
    throw new Error(`Failed to compare PDF documents: ${error.message}`);
  }
}

/**
 * Compare two policy documents
 */
function compareTwoPolicies(policy1Text: string, policy2Text: string): ComparisonResult {
  // Split into sections
  const policy1Sections = splitIntoSections(policy1Text);
  const policy2Sections = splitIntoSections(policy2Text);
  
  // Identify differences
  const { modifiedPairs, onlyInOld, onlyInNew } = identifyModifiedSections(policy1Sections, policy2Sections);
  
  // Build the comparison result
  const differences: DocumentDifference[] = [];
  
  // Add removed sections
  onlyInOld.forEach((section, index) => {
    const sectionName = `Policy 1: Section ${index + 1}`;
    differences.push({
      type: 'removed',
      section: sectionName,
      description: trimForDisplay(section)
    });
  });
  
  // Add added sections
  onlyInNew.forEach((section, index) => {
    const sectionName = `Policy 2: Section ${index + 1}`;
    differences.push({
      type: 'added',
      section: sectionName,
      description: trimForDisplay(section)
    });
  });
  
  // Add modified sections
  modifiedPairs.forEach(([oldSection, newSection], index) => {
    const sectionName = `Modified Section ${index + 1}`;
    differences.push({
      type: 'modified',
      section: sectionName,
      description: `Changed from "${trimForDisplay(oldSection)}" to "${trimForDisplay(newSection)}"`
    });
  });
  
  return {
    addedClauses: onlyInNew.length,
    removedClauses: onlyInOld.length,
    modifiedClauses: modifiedPairs.length,
    details: differences
  };
}

/**
 * Compare template completion (template vs. client document)
 * Focuses on identifying fields that should be filled but are missing
 */
function compareTemplateCompletion(templateText: string, clientDocText: string): ComparisonResult {
  // Split into sections
  const templateSections = splitIntoSections(templateText);
  const clientSections = splitIntoSections(clientDocText);
  
  // Identify potential template fields (e.g., "[Field]", "______", etc.)
  const templateFields = templateSections.filter(section => {
    // Look for typical placeholder patterns
    return (
      section.includes('[') && section.includes(']') ||
      section.includes('____') ||
      section.includes('...') ||
      section.includes('(') && section.includes(')') && section.includes('fill') ||
      section.includes('please enter') ||
      section.includes('please provide')
    );
  });
  
  // Check if these fields are properly filled in the client document
  const missingFields: string[] = [];
  const properlyFilled: string[] = [];
  const incompleteFields: [string, string][] = [];
  
  templateFields.forEach(field => {
    let fieldFilled = false;
    
    // Try to find a corresponding section in client doc
    for (const clientSection of clientSections) {
      const similarity = calculateSimilarity(field, clientSection);
      
      // If very similar but not identical, it might be partially filled
      if (similarity >= 0.6 && similarity < 0.95) {
        incompleteFields.push([field, clientSection]);
        fieldFilled = true;
        break;
      }
      
      // If quite different (similarity < 0.6), it might be properly filled
      // but we need to check if it contains the structural elements of the template
      if (similarity < 0.6) {
        // Extract the structural parts of the field (e.g., "Name: [____]" -> "Name:")
        const fieldStructure = field.replace(/\[.*?\]|_+|\.\.\./g, '').trim();
        
        if (clientSection.includes(fieldStructure) && 
            !clientSection.includes('[') && 
            !clientSection.includes('____') && 
            !clientSection.includes('...')) {
          properlyFilled.push(field);
          fieldFilled = true;
          break;
        }
      }
    }
    
    if (!fieldFilled) {
      missingFields.push(field);
    }
  });
  
  // Build the comparison result
  const differences: DocumentDifference[] = [];
  
  // Add missing fields
  missingFields.forEach((field, index) => {
    differences.push({
      type: 'removed',
      section: `Missing Field ${index + 1}`,
      description: trimForDisplay(field)
    });
  });
  
  // Add incomplete fields
  incompleteFields.forEach(([template, client], index) => {
    differences.push({
      type: 'modified',
      section: `Incomplete Field ${index + 1}`,
      description: `Field "${trimForDisplay(template)}" is partially filled with "${trimForDisplay(client)}"`
    });
  });
  
  // Add properly filled fields - these are actually "additions" from template to client doc
  properlyFilled.forEach((field, index) => {
    differences.push({
      type: 'added',
      section: `Completed Field ${index + 1}`,
      description: `Successfully completed: ${trimForDisplay(field)}`
    });
  });
  
  return {
    addedClauses: properlyFilled.length,
    removedClauses: missingFields.length,
    modifiedClauses: incompleteFields.length,
    details: differences
  };
}

/**
 * Compare multiple policy documents
 * Identifies common clauses and unique elements across all policies
 */
function compareMultiplePolicies(policy1Text: string, policy2Text: string, additionalTexts: string[]): ComparisonResult {
  // Combine all texts into a single array
  const allPolicyTexts = [policy1Text, policy2Text, ...additionalTexts];
  const allPolicySections = allPolicyTexts.map(text => splitIntoSections(text));
  
  // Track unique and common sections
  const uniqueSections: { [policyIndex: number]: string[] } = {};
  const commonSections: string[] = [];
  
  // Initialize uniqueSections object
  allPolicyTexts.forEach((_, index) => {
    uniqueSections[index] = [];
  });
  
  // Compare first policy against all others to find its unique sections
  allPolicySections[0].forEach(section => {
    let isUnique = true;
    
    // Check if this section appears in any other policy
    for (let i = 1; i < allPolicySections.length; i++) {
      const otherPolicySections = allPolicySections[i];
      
      for (const otherSection of otherPolicySections) {
        const similarity = calculateSimilarity(section, otherSection);
        
        if (similarity >= 0.75) {
          isUnique = false;
          
          // If very similar, consider it a common section
          if (similarity >= 0.9) {
            // Only add it once to common sections
            if (!commonSections.some(common => calculateSimilarity(common, section) >= 0.9)) {
              commonSections.push(section);
            }
          }
          break;
        }
      }
      
      if (!isUnique) break;
    }
    
    if (isUnique) {
      uniqueSections[0].push(section);
    }
  });
  
  // Repeat for all other policies
  for (let policyIndex = 1; policyIndex < allPolicySections.length; policyIndex++) {
    const policySections = allPolicySections[policyIndex];
    
    policySections.forEach(section => {
      let isUnique = true;
      
      // Check if this section appears in any other policy
      for (let i = 0; i < allPolicySections.length; i++) {
        if (i === policyIndex) continue; // Skip comparing to self
        
        const otherPolicySections = allPolicySections[i];
        
        for (const otherSection of otherPolicySections) {
          const similarity = calculateSimilarity(section, otherSection);
          
          if (similarity >= 0.75) {
            isUnique = false;
            break;
          }
        }
        
        if (!isUnique) break;
      }
      
      if (isUnique) {
        uniqueSections[policyIndex].push(section);
      }
    });
  }
  
  // Build the comparison result
  const differences: DocumentDifference[] = [];
  
  // Add common sections as "modified" (since they're in multiple documents)
  commonSections.forEach((section, index) => {
    differences.push({
      type: 'modified',
      section: `Common Clause ${index + 1}`,
      description: `Found in all policies: ${trimForDisplay(section)}`
    });
  });
  
  // Add unique sections from each policy
  Object.entries(uniqueSections).forEach(([policyIndex, sections]) => {
    const policyNumber = Number(policyIndex) + 1;
    
    sections.forEach((section, index) => {
      differences.push({
        type: policyNumber === 1 ? 'removed' : 'added',  // Policy 1 unique = removed, others = added
        section: `Policy ${policyNumber} Unique Clause ${index + 1}`,
        description: trimForDisplay(section)
      });
    });
  });
  
  // Count statistics
  const totalUnique = Object.values(uniqueSections)
    .reduce((sum, sections) => sum + sections.length, 0);
  
  return {
    addedClauses: totalUnique - (uniqueSections[0]?.length || 0),  // Unique in other policies
    removedClauses: uniqueSections[0]?.length || 0,  // Unique in first policy
    modifiedClauses: commonSections.length,  // Common across policies
    details: differences
  };
}

/**
 * Trim text for display (reduce to a readable length)
 */
function trimForDisplay(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}