import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sample lists for our demo
const demoLists = [
  {
    id: 'all-partners',
    name: 'All Partners',
    isDefault: true
  },
  {
    id: '1',
    name: 'Active Insurance Brokers',
    isDefault: false
  },
  {
    id: '2',
    name: 'Consulting Partners',
    isDefault: false
  },
  {
    id: '3',
    name: 'Enterprise Partners',
    isDefault: false
  }
];

export default function ButtonOptionsDemo() {
  const [activeList1, setActiveList1] = useState(demoLists[1]);
  const [activeList2, setActiveList2] = useState(demoLists[1]);
  const [activeList3, setActiveList3] = useState(demoLists[1]);
  const [activeList4, setActiveList4] = useState(demoLists[1]);
  const [showDropdown1, setShowDropdown1] = useState(false);
  const [showDropdown2, setShowDropdown2] = useState(false);
  const [showDropdown3, setShowDropdown3] = useState(false);
  const [showDropdown4, setShowDropdown4] = useState(false);

  const resetList = (setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter(null);
  };

  return (
    <div className="p-8 space-y-10 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Clear Button Options Demo</h1>
        <p className="text-gray-600">Compare different placements for the clear button to see which is most intuitive.</p>
      </header>
      
      {/* Option 1: X next to list name in dropdown trigger */}
      <section className="border p-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Option 1: Clear Button Next to List Name</h2>
        <p className="text-gray-600 mb-4">A small X button appears next to the selected list name, similar to tag patterns.</p>
        
        <div className="flex items-center gap-3 my-4">
          <div className="relative">
            <button 
              className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
              onClick={() => setShowDropdown1(!showDropdown1)}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                
                {activeList1 ? (
                  <div className="flex items-center">
                    <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>{activeList1.name}</span>
                    <button 
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetList(setActiveList1);
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18"></path>
                        <path d="m6 6 12 12"></path>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Select a saved list</span>
                )}
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-500">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>
            
            {showDropdown1 && (
              <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Saved Lists
                  </div>
                  
                  {demoLists.map(list => (
                    <div 
                      key={list.id} 
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setActiveList1(list);
                        setShowDropdown1(false);
                      }}
                    >
                      <span>{list.name}</span>
                      {list.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Option 2: First option in dropdown menu */}
      <section className="border p-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Option 2: First Option in Dropdown</h2>
        <p className="text-gray-600 mb-4">"View All Partners" or similar option as the first item in the dropdown menu.</p>
        
        <div className="flex items-center gap-3 my-4">
          <div className="relative">
            <button 
              className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
              onClick={() => setShowDropdown2(!showDropdown2)}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                
                {activeList2 ? (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>{activeList2.name}</span>
                ) : (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Select a saved list</span>
                )}
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-500">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>
            
            {showDropdown2 && (
              <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Saved Lists
                  </div>
                  
                  {/* First option to clear selection */}
                  <div 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => {
                      resetList(setActiveList2);
                      setShowDropdown2(false);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                      <path d="M18 6 6 18"></path>
                      <path d="m6 6 12 12"></path>
                    </svg>
                    <span>View All Partners</span>
                  </div>
                  
                  {demoLists.map(list => (
                    <div 
                      key={list.id} 
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setActiveList2(list);
                        setShowDropdown2(false);
                      }}
                    >
                      <span>{list.name}</span>
                      {list.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Option 3: Secondary action below dropdown */}
      <section className="border p-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Option 3: Secondary Action Below Dropdown</h2>
        <p className="text-gray-600 mb-4">A text link below the dropdown for clearing the selection.</p>
        
        <div className="flex flex-col gap-1 my-4">
          <div className="relative">
            <button 
              className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
              onClick={() => setShowDropdown3(!showDropdown3)}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                
                {activeList3 ? (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>{activeList3.name}</span>
                ) : (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Select a saved list</span>
                )}
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-500">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>
            
            {showDropdown3 && (
              <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Saved Lists
                  </div>
                  
                  {demoLists.map(list => (
                    <div 
                      key={list.id} 
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setActiveList3(list);
                        setShowDropdown3(false);
                      }}
                    >
                      <span>{list.name}</span>
                      {list.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {activeList3 && (
            <button 
              className="text-xs text-blue-600 hover:text-blue-800 self-start mt-1"
              onClick={() => resetList(setActiveList3)}
            >
              Return to all partners
            </button>
          )}
        </div>
      </section>
      
      {/* Option 4: Separate clear button next to dropdown */}
      <section className="border p-6 rounded-lg bg-white">
        <h2 className="text-xl font-semibold mb-4">Option 4: Separate Clear Button</h2>
        <p className="text-gray-600 mb-4">A distinct button that appears next to the dropdown when a list is selected.</p>
        
        <div className="flex items-center gap-2 my-4">
          <div className="relative">
            <button 
              className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
              onClick={() => setShowDropdown4(!showDropdown4)}
            >
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-gray-500">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                
                {activeList4 ? (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>{activeList4.name}</span>
                ) : (
                  <span className="font-medium text-[#282A3F]" style={{ fontFamily: 'Poppins, sans-serif' }}>Select a saved list</span>
                )}
                
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-gray-500">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </span>
            </button>
            
            {showDropdown4 && (
              <div className="absolute z-10 mt-1 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b">
                    Saved Lists
                  </div>
                  
                  {demoLists.map(list => (
                    <div 
                      key={list.id} 
                      className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setActiveList4(list);
                        setShowDropdown4(false);
                      }}
                    >
                      <span>{list.name}</span>
                      {list.isDefault && <span className="text-xs text-gray-500">(Default)</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {activeList4 && (
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-600"
              onClick={() => resetList(setActiveList4)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Clear Selection
            </Button>
          )}
        </div>
      </section>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Recommendations</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Option 1 (X next to name)</strong> - Most space-efficient, follows established UI patterns from tag selections.</li>
          <li><strong>Option 2 (First dropdown item)</strong> - Very clear choice presented as an alternative option rather than a "clear" action.</li>
          <li><strong>Option 3 (Link below)</strong> - Clean UI but might be less noticeable.</li>
          <li><strong>Option 4 (Separate button)</strong> - Very clear but takes up more space and is similar to current implementation.</li>
        </ul>
      </div>
    </div>
  );
}