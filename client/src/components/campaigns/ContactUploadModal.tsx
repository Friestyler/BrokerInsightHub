import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import UploadProcessPage from "@/pages/DataUpload/UploadProcessPage";

interface ContactUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (uploadedContacts: any[]) => void;
}

export default function ContactUploadModal({ isOpen, onClose, onUploadComplete }: ContactUploadModalProps) {
  const [uploadCompleted, setUploadCompleted] = useState(false);
  const [uploadedData, setUploadedData] = useState<any[]>([]);

  const handleUploadComplete = (data: any[]) => {
    setUploadedData(data);
    setUploadCompleted(true);
    if (onUploadComplete) {
      onUploadComplete(data);
    }
  };

  const handleClose = () => {
    setUploadCompleted(false);
    setUploadedData([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>Upload Contacts</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {uploadCompleted ? (
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-green-600 mb-2">Upload Complete!</h3>
                <p className="text-gray-600 mb-4">
                  Successfully uploaded {uploadedData.length} contacts.
                </p>
                <Button onClick={handleClose}>
                  Continue to Campaign
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {/* Pass entityType as 'contacts' to skip entity selection step */}
              <UploadProcessPage 
                entityType="contacts" 
                onUploadComplete={handleUploadComplete}
                isModal={true}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}