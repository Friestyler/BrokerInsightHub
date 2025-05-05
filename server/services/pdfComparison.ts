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
 * Compare two PDF documents and return the differences
 */
export async function comparePdfDocuments(
  oldDocPath: string,
  newDocPath: string
): Promise<ComparisonResult> {
  try {
    // Extract text from both documents
    const oldText = await extractTextFromPdf(oldDocPath);
    const newText = await extractTextFromPdf(newDocPath);
    
    // Split into sections
    const oldSections = splitIntoSections(oldText);
    const newSections = splitIntoSections(newText);
    
    // Identify differences
    const { modifiedPairs, onlyInOld, onlyInNew } = identifyModifiedSections(oldSections, newSections);
    
    // Build the comparison result
    const differences: DocumentDifference[] = [];
    
    // Add removed sections
    onlyInOld.forEach((section, index) => {
      const sectionName = `Section ${index + 1}`;
      differences.push({
        type: 'removed',
        section: sectionName,
        description: trimForDisplay(section)
      });
    });
    
    // Add added sections
    onlyInNew.forEach((section, index) => {
      const sectionName = `Section ${index + 1}`;
      differences.push({
        type: 'added',
        section: sectionName,
        description: trimForDisplay(section)
      });
    });
    
    // Add modified sections
    modifiedPairs.forEach(([oldSection, newSection], index) => {
      const sectionName = `Section ${index + 1}`;
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
  } catch (error) {
    console.error(`Error comparing PDF documents: ${error}`);
    throw new Error(`Failed to compare PDF documents: ${error.message}`);
  }
}

/**
 * Trim text for display (reduce to a readable length)
 */
function trimForDisplay(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}