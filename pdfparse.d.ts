// Type definitions for pdf-parse
declare module 'pdf-parse' {
  export interface PDFData {
    text: string;
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion: string;
      IsAcroFormPresent: boolean;
      IsXFAPresent: boolean;
      [key: string]: any;
    };
    metadata: {
      [key: string]: any;
    };
    version: string;
  }

  function parse(dataBuffer: Buffer, options?: {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }): Promise<PDFData>;

  namespace parse {
    export { parse };
  }

  export default parse;
}