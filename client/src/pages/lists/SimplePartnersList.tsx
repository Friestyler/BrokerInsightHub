import { useState, useEffect } from 'react';
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

// Sample data for partners
const mockPartners = [
  {
    id: 1,
    name: "XYZ Insurance Group",
    initials: "XY",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 3,
    opportunities: 3
  },
  {
    id: 2,
    name: "ABC Insurance Brokers",
    initials: "AB",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 5,
    opportunities: 4
  },
  {
    id: 3,
    name: "Global Insurance Partners",
    initials: "GI",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 15,
    opportunities: 12
  },
  {
    id: 4,
    name: "Premier Insurance Agency",
    initials: "PI",
    industry: "Insurance",
    type: "Agency",
    status: "inactive",
    size: "medium",
    customers: 6,
    opportunities: 3
  },
  {
    id: 5,
    name: "Secure Financial Services",
    initials: "SF",
    industry: "Finance",
    type: "Broker",
    status: "active",
    size: "large",
    customers: 22,
    opportunities: 15
  },
  {
    id: 6,
    name: "Pinnacle Risk Solutions",
    initials: "PR",
    industry: "Insurance",
    type: "Broker",
    status: "active",
    size: "enterprise",
    customers: 18,
    opportunities: 9
  }
];

// Sample list for demonstration
const sampleList = {
  id: "list1",
  name: "Top Insurance Brokers",
  members: [1, 2, 3]
};

export default function SimplePartnersList() {
  const { environment } = useEnvironment();
  
  // List editing state
  const [isEditingList, setIsEditingList] = useState(false);
  const [isSavingList, setIsSavingList] = useState(false);
  const [editedListMembers, setEditedListMembers] = useState<number[]>(sampleList.members);
  const [activeList, setActiveList] = useState(sampleList);
  
  return (
    <div className="max-w-full py-6 pl-8">
      <div className="flex justify-between items-center mb-2 px-4">
        <h1 className="text-2xl font-bold tracking-tight text-black">Partners</h1>
        
        {/* New Partner button */}
        <button 
          className="flex items-center rounded-md bg-[#5567E5] text-white px-4 py-2 hover:bg-[#4555CB] transition-colors"
          onClick={() => {
            // This would navigate to a partner creation form in a real implementation
            alert('This would open the new partner creation form in the real application');
          }}
          style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="font-medium">Create new partner</span>
        </button>
      </div>
      
      {/* Card with search and filters */}
      <div className="p-4">
        <div className="bg-white shadow-sm rounded-md p-4 mb-4">
          <div className="flex justify-between">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold">List: {activeList.name}</h2>
            </div>
            
            {/* Edit List button */}
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center ${isEditingList ? 'bg-indigo-50 text-indigo-700 border-indigo-500' : ''}`}
              onClick={() => setIsEditingList(!isEditingList)}
              disabled={isEditingList && isSavingList}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit list
            </Button>
          </div>
        </div>
      </div>
      
      {/* Edit Mode Indicator */}
      {isEditingList && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg mb-4 p-4 mx-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <div>
              <h3 className="text-base font-medium text-indigo-900">Editing "{activeList.name}" List</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Use the checkboxes to select or deselect partners. All selected partners will be included in this list when you save.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Partners Table */}
      <div className="bg-white overflow-x-auto rounded-lg mx-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="relative px-3 py-3.5 w-10">
                <input
                  type="checkbox"
                  className="absolute h-4 w-4 rounded border-gray-300"
                  checked={editedListMembers.length === mockPartners.length && mockPartners.length > 0}
                  onChange={() => {
                    if (editedListMembers.length === mockPartners.length) {
                      setEditedListMembers([]);
                    } else {
                      setEditedListMembers(mockPartners.map(p => p.id));
                    }
                  }}
                />
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 w-[250px]">
                <div className="flex items-center">
                  Partner
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Industry
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Type
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Size
                </div>
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                <div className="flex items-center">
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {mockPartners.map((partner) => (
              <tr 
                key={partner.id} 
                className={`hover:bg-gray-50 group ${
                  isEditingList
                    ? (editedListMembers.includes(partner.id) ? 'bg-blue-50' : '')
                    : (sampleList.members.includes(partner.id) ? 'bg-blue-50' : '')
                }`}
              >
                <td className="relative whitespace-nowrap py-4 pl-3 pr-3 text-sm w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={isEditingList ? editedListMembers.includes(partner.id) : sampleList.members.includes(partner.id)}
                    onChange={() => {
                      if (isEditingList) {
                        if (editedListMembers.includes(partner.id)) {
                          setEditedListMembers(editedListMembers.filter(id => id !== partner.id));
                        } else {
                          setEditedListMembers([...editedListMembers, partner.id]);
                        }
                      }
                    }}
                    disabled={!isEditingList}
                  />
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <div className="flex items-center">
                    <Avatar className="h-9 w-9 mr-3 bg-indigo-100 text-indigo-600">
                      <AvatarFallback>{partner.initials}</AvatarFallback>
                    </Avatar>
                    <Link href={`/lists/partners/${partner.id}`} className="font-medium text-gray-900 hover:text-indigo-700">{partner.name}</Link>
                  </div>
                </td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.industry}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">{partner.type}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm capitalize">{partner.size}</td>
                <td className="whitespace-nowrap py-4 pl-3 pr-3 text-sm">
                  <Badge variant={partner.status === 'active' ? 'outline' : 'secondary'} className="capitalize">
                    {partner.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Save button when in edit mode */}
      {isEditingList && (
        <div className="flex justify-end mt-4 mx-4">
          <Button 
            size="sm" 
            className="md:flex items-center bg-[#5567E5] hover:bg-[#4151c4] text-white"
            onClick={() => {
              setIsSavingList(true);
              // Here would be the actual save logic in a real implementation
              setTimeout(() => {
                setIsEditingList(false);
                setIsSavingList(false);
                // Update the sample list with edited members
                setActiveList({
                  ...activeList,
                  members: [...editedListMembers]
                });
                // Show success toast
                alert('List saved successfully');
              }, 800);
            }}
            disabled={isSavingList}
          >
            {isSavingList ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}