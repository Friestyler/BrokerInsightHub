// This is a corrected version of the opportunities section structure
// Line 1878 should have the missing closing tag </div>

{/* Opportunities section with corrected JSX structure */}
{activeTab === "opportunities" && (
  <div className="space-y-4">
    {/* Enhanced unified toolbar - same as OpportunitiesPage */}
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top row with saved lists and views */}
        <div className="flex flex-wrap items-center justify-between">
          {/* Left side - Saved Lists with actions */}
          <div className="flex items-center gap-3">
            {/* Saved Lists collapsible header */}
            <button 
              className="flex items-center space-x-2 text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors"
              onClick={() => setIsOpportunitiesListsCollapsed(!isOpportunitiesListsCollapsed)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`transition-transform ${isOpportunitiesListsCollapsed ? 'rotate-0' : 'rotate-90'}`}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span>Saved Lists ({partnerRelevantLists.length})</span>
            </button>
          </div>
          
          {/* Collapsed lists section */}
          {!isOpportunitiesListsCollapsed && (
            <div className="space-y-2">
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="flex items-center space-x-2 px-4 py-2.5 border rounded-md text-sm font-medium shadow-sm bg-white hover:bg-gray-50"
                  onClick={() => setShowListsDropdown(!showListsDropdown)}
                >
                  <span className="font-medium text-[#282A3F]">
                    {activeList ? activeList.name : 'All opportunities'}
                  </span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`transition-transform ${showListsDropdown ? 'rotate-180' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                
                {showListsDropdown && (
                  <div className="absolute z-10 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200">
                    <div className="p-2">
                      <button 
                        onClick={() => {
                          setActiveList(null);
                          setShowListsDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                          !activeList ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                        }`}
                      >
                        All opportunities
                      </button>
                      {partnerRelevantLists.map((list) => (
                        <button
                          key={list.id}
                          onClick={() => {
                            setActiveList(list);
                            setShowListsDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#F5F6FA] ${
                            activeList?.id === list.id ? 'bg-[#E1E4FB] text-[#3E4DC4]' : 'text-gray-700'
                          }`}
                        >
                          {list.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Right-side action buttons */}
        <div className="flex items-center gap-2">
          {/* Bulk Action buttons */}
          {selectedOpportunities.length > 0 && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowSaveListModal(true)}
              >
                Save to List
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedOpportunities([])}
              >
                Clear Selection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}