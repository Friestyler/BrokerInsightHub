import { useState, useMemo } from 'react';

interface BaseOKR {
  id: number;
  parent?: number;
  [key: string]: any;
}

export function useHierarchicalOKRs<T extends BaseOKR>(okrs: T[]) {
  const [expandedOKRs, setExpandedOKRs] = useState<Set<number>>(new Set());
  const [selectedOKRs, setSelectedOKRs] = useState<number[]>([]);

  // Calculate nested counts for each OKR
  const nestedCounts = useMemo(() => {
    const countsMap = new Map();
    okrs.forEach(okr => {
      const childrenCount = okrs.filter(child => child.parent === okr.id).length;
      countsMap.set(okr.id, childrenCount);
    });
    return countsMap;
  }, [okrs]);

  // Check if an OKR has children
  const hasChildren = (okrId: number) => {
    return nestedCounts.get(okrId) > 0;
  };

  // Get children of an OKR
  const getChildren = (parentId: number): T[] => {
    return okrs.filter(okr => okr.parent === parentId);
  };

  // Get only parent OKRs (no parent field)
  const parentOKRs = useMemo((): T[] => {
    return okrs.filter(okr => !okr.parent);
  }, [okrs]);

  // Toggle expansion of an OKR
  const toggleOKRExpansion = (id: number) => {
    setExpandedOKRs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle selection changes
  const handleSelectionChange = (okrId: number, checked: boolean) => {
    if (checked) {
      setSelectedOKRs(prev => [...prev, okrId]);
    } else {
      setSelectedOKRs(prev => prev.filter(id => id !== okrId));
    }
  };

  return {
    expandedOKRs,
    selectedOKRs,
    setSelectedOKRs,
    nestedCounts,
    hasChildren,
    getChildren,
    parentOKRs,
    toggleOKRExpansion,
    handleSelectionChange
  };
}