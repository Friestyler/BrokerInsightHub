import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileSpreadsheet } from 'lucide-react';
import DataUploadOptions from '@/pages/DataUpload/DataUploadOptions';
import DeGoudseUploadWizard from '@/pages/DataUpload/DeGoudseUploadWizard';

export default function DataUploadTabs() {
  return (
    <div className="w-full">
      <Tabs defaultValue="data-upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="data-upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Data Upload
          </TabsTrigger>
          <TabsTrigger value="data-upload-2" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Data Upload 2
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="data-upload" className="mt-6">
          <div className="w-full">
            <DataUploadOptions />
          </div>
        </TabsContent>
        
        <TabsContent value="data-upload-2" className="mt-6">
          <div className="w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Data Upload 2</h1>
              <p className="text-gray-600">Direct access to De Goudse Data Use Case Upload</p>
            </div>
            <DeGoudseUploadWizard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}