declare module 'react-pivottable/PivotTableUI' {
  import { Component } from 'react';
  
  interface PivotTableUIProps {
    data: any[];
    onChange?: (state: any) => void;
    rows?: string[];
    cols?: string[];
    vals?: string[];
    aggregatorName?: string;
    rendererName?: string;
    valueFilter?: Record<string, any>;
    [key: string]: any;
  }
  
  class PivotTableUI extends Component<PivotTableUIProps> {}
  
  namespace PivotTableUI {
    const defaultProps: {
      renderers: Record<string, any>;
    };
  }
  
  export default PivotTableUI;
}

declare module 'react-pivottable/pivottable.css' {
  const content: any;
  export default content;
}