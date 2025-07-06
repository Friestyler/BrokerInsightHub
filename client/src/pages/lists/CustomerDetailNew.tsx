import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronUp, ChevronRight, Shield, TrendingUp, Clock, AlertTriangle, Target, Zap, Briefcase, Plane, PiggyBank, Scale, DollarSign, CheckCircle, ArrowUp, Filter, Crown } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import PartnerActivityHub from "@/components/activity/PartnerActivityHub";
import { useToast } from "@/hooks/use-toast";
import { PortfolioOverviewTab } from "@/components/portfolio/PortfolioOverviewTab";

export default function CustomerDetailNew() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("products");
  const [activeProductTab, setActiveProductTab] = useState("overview");
  const [backUrl, setBackUrl] = useState("/customers");
  const [backLabel, setBackLabel] = useState("Back to Customers");

  // Detect iframe mode
  const urlParams = new URLSearchParams(window.location.search);
  const isIframeMode = urlParams.get('iframe') === 'true';

  // Error boundary for runtime safety
  const [hasError, setHasError] = useState(false);
  
  // Category navigation state
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Toggle category selection for filtering
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Runtime error caught:', event.error);
      setHasError(true);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
  
  // Handle back navigation from stored location
  useEffect(() => {
    const previousLocation = sessionStorage.getItem('previousLocation');
    if (previousLocation) {
      setBackUrl(previousLocation);
      // Clear the stored location after using it
      sessionStorage.removeItem('previousLocation');
      
      // Set appropriate back label based on the previous location
      if (previousLocation.includes('/opportunities')) {
        setBackLabel("Back to Opportunities");
      } else if (previousLocation.includes('/partners')) {
        setBackLabel("Back to Partners");
      } else {
        setBackLabel("Back to Customers");
      }
    }
  }, []);
  
  // OKR metrics state management
  const [selectedMetrics, setSelectedMetrics] = useState<number[]>([]);
  
  // Product dashboard filters  
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Tooltip and product list dialog state
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [isProductListDialogOpen, setIsProductListDialogOpen] = useState(false);
  const [selectedTooltipProducts, setSelectedTooltipProducts] = useState<any[]>([]);
  const [tooltipCategoryName, setTooltipCategoryName] = useState('');
  
  // Customer popup states for products
  const [customerPopupOpen, setCustomerPopupOpen] = useState(false);
  const [selectedProductForCustomers, setSelectedProductForCustomers] = useState<number | null>(null);
  


  // Get category info from database with fallback colors
  const getCategoryInfo = (categoryName: string) => {
    const dbCategory = Array.isArray(categories) ? categories.find((cat: any) => cat.name === categoryName) : null;
    if (dbCategory) {
      return {
        color: dbCategory.color || 'blue',
        icon: dbCategory.icon,
        id: dbCategory.id
      };
    }
    
    // Fallback colors if not in database
    const fallbackColors: any = {
      'Life Insurance': 'green',
      'Non-Life Insurance': 'blue', 
      'Services': 'purple'
    };
    
    return {
      color: fallbackColors[categoryName] || 'gray',
      icon: null,
      id: null
    };
  };

  // Helper function to render category badge like Products page
  const renderCategoryBadge = (category: any) => {
    const iconMap: any = {
      'shield': Shield,
      'trending-up': TrendingUp,
      'briefcase': Briefcase,
      'target': Target,
      'zap': Zap,
      'clock': Clock,
      'alert-triangle': AlertTriangle,
      'check-circle': CheckCircle,
      'arrow-up': ArrowUp,
      'dollar-sign': DollarSign,
      'users': Users,
      'package': Package,
      'plane': Plane,
      'piggy-bank': PiggyBank,
      'scale': Scale
    };
    
    const IconComponent = category.icon ? iconMap[category.icon] : null;
    
    // Get color classes based on database color
    const getColorClasses = (color: string) => {
      const colorMap: any = {
        'green': 'border-green-200 bg-green-50 text-green-700',
        'blue': 'border-blue-200 bg-blue-50 text-blue-700',
        'purple': 'border-purple-200 bg-purple-50 text-purple-700',
        'orange': 'border-orange-200 bg-orange-50 text-orange-700',
        'red': 'border-red-200 bg-red-50 text-red-700',
        'gray': 'border-gray-200 bg-gray-50 text-gray-700'
      };
      return colorMap[color] || colorMap['gray'];
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`capitalize flex items-center gap-1.5 ${getColorClasses(category.color)}`}
      >
        {IconComponent && <IconComponent className="w-3 h-3" />}
        {category.name}
      </Badge>
    );
  };

  // Helper function to get gradient classes that match badge colors exactly
  const getBarGradientClasses = (color: string) => {
    const gradientMap: any = {
      'green': 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
      'blue': 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800',
      'purple': 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800',
      'orange': 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800',
      'red': 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
      'gray': 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
    };
    
    return gradientMap[color] || gradientMap['gray'];
  };

  // Filter categories based on selection with animated bars
  const getFilteredCategories = (): any[] => {
    const allCategories = [
      {
        name: 'Life Insurance',
        ...getCategoryInfo('Life Insurance'),
        covered: 2,
        total: 8,
        percentage: 25,
        currentPremium: 2400,
        potentialUplift: 6600,
        coveredProducts: [
          { name: 'Death Cover Basic', premium: 1200 },
          { name: 'Group Insurance Plan', premium: 1200 }
        ],
        availableProducts: [
          { name: 'Branch 21 Investment', premium: 2400 },
          { name: 'Branch 23 Investment', premium: 1800 },
          { name: 'Pension Savings Plan', premium: 600 },
          { name: 'IPT Insurance', premium: 480 },
          { name: 'Term Life Insurance', premium: 360 },
          { name: 'Disability Insurance', premium: 960 }
        ]
      },
      {
        name: 'Non-Life Insurance',
        ...getCategoryInfo('Non-Life Insurance'),
        covered: 5,
        total: 12,
        percentage: 42,
        currentPremium: 3200,
        potentialUplift: 4200,
        coveredProducts: [
          { name: 'Auto Insurance Premium', premium: 840 },
          { name: 'Health Insurance Basic', premium: 960 },
          { name: 'Home Insurance Standard', premium: 1200 },
          { name: 'Business Liability', premium: 150 },
          { name: 'Travel Insurance', premium: 50 }
        ],
        availableProducts: [
          { name: 'Cyber Security Insurance', premium: 1200 },
          { name: 'Fire Insurance', premium: 800 },
          { name: 'Legal Protection', premium: 680 },
          { name: 'Professional Indemnity', premium: 450 },
          { name: 'Equipment Insurance', premium: 320 },
          { name: 'Environmental Liability', premium: 400 },
          { name: 'Director\'s Insurance', premium: 350 }
        ]
      },
      {
        name: 'Services',
        ...getCategoryInfo('Services'),
        covered: 0,
        total: 3,
        percentage: 0,
        currentPremium: 0,
        potentialUplift: 1950,
        coveredProducts: [],
        availableProducts: [
          { name: 'Legal Services Package', premium: 650 },
          { name: 'HR Consulting Services', premium: 800 },
          { name: 'Financial Advisory', premium: 500 }
        ]
      }
    ];

    const filteredCategories: any[] = [];
    
    for (const selectedCat of selectedCategories) {
      // Check if it's a main category
      const mainCategory = allCategories.find(cat => cat.name === selectedCat);
      if (mainCategory) {
        filteredCategories.push(mainCategory);
        continue;
      }
      
      // Check if it's a subcategory - create individual category for it
      if (selectedCat === 'Death Cover') {
        filteredCategories.push({
          name: 'Death Cover',
          covered: 1,
          total: 2,
          percentage: 50,
          color: 'green',
          currentPremium: 1400,
          potentialUplift: 2800,
          coveredProducts: [
            { name: 'Basic Death Cover', premium: 1400 }
          ],
          availableProducts: [
            { name: 'Premium Death Cover', premium: 1400 }
          ]
        });
      } else if (selectedCat === 'Branch 21') {
        filteredCategories.push({
          name: 'Branch 21',
          covered: 1,
          total: 2,
          percentage: 50,
          color: 'green',
          currentPremium: 1200,
          potentialUplift: 2400,
          coveredProducts: [
            { name: 'Branch 21 Savings', premium: 1200 }
          ],
          availableProducts: [
            { name: 'Branch 21 Premium', premium: 1200 }
          ]
        });
      } else if (selectedCat === 'Branch 23') {
        filteredCategories.push({
          name: 'Branch 23',
          covered: 0,
          total: 2,
          percentage: 0,
          color: 'green',
          currentPremium: 0,
          potentialUplift: 3000,
          coveredProducts: [],
          availableProducts: [
            { name: 'Branch 23 Investment', premium: 1500 },
            { name: 'Branch 23 Growth', premium: 1500 }
          ]
        });
      } else if (selectedCat === 'Group Insurance') {
        filteredCategories.push({
          name: 'Group Insurance',
          covered: 0,
          total: 2,
          percentage: 0,
          color: 'green',
          currentPremium: 0,
          potentialUplift: 1800,
          coveredProducts: [],
          availableProducts: [
            { name: 'Employee Group Plan', premium: 900 },
            { name: 'Executive Group Plan', premium: 900 }
          ]
        });
      } else if (selectedCat === 'Health') {
        filteredCategories.push({
          name: 'Health',
          covered: 1,
          total: 2,
          percentage: 50,
          color: 'orange',
          currentPremium: 960,
          potentialUplift: 1920,
          coveredProducts: [
            { name: 'Health Insurance Basic', premium: 960 }
          ],
          availableProducts: [
            { name: 'Health Insurance Premium', premium: 960 }
          ]
        });
      } else if (selectedCat === 'Auto') {
        filteredCategories.push({
          name: 'Auto',
          covered: 1,
          total: 3,
          percentage: 33,
          color: 'orange',
          currentPremium: 840,
          potentialUplift: 2520,
          coveredProducts: [
            { name: 'Auto Insurance Premium', premium: 840 }
          ],
          availableProducts: [
            { name: 'Comprehensive Auto', premium: 840 },
            { name: 'Commercial Auto', premium: 840 }
          ]
        });
      } else if (selectedCat === 'Property') {
        filteredCategories.push({
          name: 'Property',
          covered: 1,
          total: 3,
          percentage: 33,
          color: 'orange',
          currentPremium: 1200,
          potentialUplift: 3600,
          coveredProducts: [
            { name: 'Home Insurance Standard', premium: 1200 }
          ],
          availableProducts: [
            { name: 'Fire Insurance', premium: 800 },
            { name: 'Property Premium', premium: 1600 }
          ]
        });
      } else if (selectedCat === 'Business') {
        filteredCategories.push({
          name: 'Business',
          covered: 1,
          total: 2,
          percentage: 50,
          color: 'orange',
          currentPremium: 150,
          potentialUplift: 300,
          coveredProducts: [
            { name: 'Business Liability', premium: 150 }
          ],
          availableProducts: [
            { name: 'Professional Indemnity', premium: 150 }
          ]
        });
      } else if (selectedCat === 'Travel') {
        filteredCategories.push({
          name: 'Travel',
          covered: 1,
          total: 2,
          percentage: 50,
          color: 'orange',
          currentPremium: 50,
          potentialUplift: 100,
          coveredProducts: [
            { name: 'Travel Insurance', premium: 50 }
          ],
          availableProducts: [
            { name: 'Business Travel', premium: 50 }
          ]
        });
      } else if (selectedCat === 'Legal Services') {
        filteredCategories.push({
          name: 'Legal Services',
          covered: 0,
          total: 1,
          percentage: 0,
          color: 'purple',
          currentPremium: 0,
          potentialUplift: 650,
          coveredProducts: [],
          availableProducts: [
            { name: 'Legal Services Package', premium: 650 }
          ]
        });
      } else if (selectedCat === 'HR Consulting') {
        filteredCategories.push({
          name: 'HR Consulting',
          covered: 0,
          total: 1,
          percentage: 0,
          color: 'purple',
          currentPremium: 0,
          potentialUplift: 800,
          coveredProducts: [],
          availableProducts: [
            { name: 'HR Consulting Services', premium: 800 }
          ]
        });
      } else if (selectedCat === 'Financial Advisory') {
        filteredCategories.push({
          name: 'Financial Advisory',
          covered: 0,
          total: 1,
          percentage: 0,
          color: 'purple',
          currentPremium: 0,
          potentialUplift: 500,
          coveredProducts: [],
          availableProducts: [
            { name: 'Financial Advisory', premium: 500 }
          ]
        });
      }
    }
    
    return filteredCategories;
  };

  // Calculate filtered totals
  const getFilteredTotals = () => {
    const filtered = getFilteredCategories();
    const totalCovered = filtered.reduce((sum, cat) => sum + cat.covered, 0);
    const totalProducts = filtered.reduce((sum, cat) => sum + cat.total, 0);
    const totalCurrentPremium = filtered.reduce((sum, cat) => sum + cat.currentPremium, 0);
    const totalPotentialUplift = filtered.reduce((sum, cat) => sum + cat.potentialUplift, 0);
    
    return {
      covered: totalCovered,
      total: totalProducts,
      percentage: totalProducts > 0 ? Math.round((totalCovered / totalProducts) * 100) : 0,
      currentPremium: totalCurrentPremium,
      potentialUplift: totalPotentialUplift
    };
  };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedRange, setSelectedRange] = useState("all");

  // Logo upload state
  const [showLogoUploadModal, setShowLogoUploadModal] = useState(false);
  const [customerLogo, setCustomerLogo] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [groupBy, setGroupBy] = useState("tag");
  
  // Details dialog state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [editedCustomer, setEditedCustomer] = useState<any>({});
  const [selectedOpportunityIds, setSelectedOpportunityIds] = useState<number[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
  // Add Product dialog state
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [selectedProductTemplate, setSelectedProductTemplate] = useState<any>(null);
  const [customAttributes, setCustomAttributes] = useState({
    customPrice: '',
    customDiscountPercentage: '',
    customPremiumPercentage: '',
    customerContractStartDate: '',
    customerContractEndDate: '',
    notes: ''
  });

  // Track configured products (products that have been set up but not necessarily saved yet)
  const [configuredProducts, setConfiguredProducts] = useState<number[]>([]);
  const [stagedProducts, setStagedProducts] = useState<Array<{
    templateId: number;
    template: any;
    customAttributes: {
      customPrice: string;
      customDiscountPercentage: string;
      customPremiumPercentage: string;
      customerContractStartDate: string;
      customerContractEndDate: string;
      notes: string;
    };
  }>>([]);

  // Product selection states
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Product dashboard interactive state
  const [expandedDashboardCategories, setExpandedDashboardCategories] = useState<Set<string>>(new Set());
  const [selectedTimelineFilter, setSelectedTimelineFilter] = useState("all");
  const [hoveredOpportunity, setHoveredOpportunity] = useState<string | null>(null);

  // Handle tab parameter from URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tabParam = urlParams.get('tab');
    const storedTab = sessionStorage.getItem('customerDetailTab');
    
    console.log('CustomerDetail URL parsing:', { location, tabParam, storedTab });
    
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (storedTab) {
      setActiveTab(storedTab);
      // Clear the stored tab after using it
      sessionStorage.removeItem('customerDetailTab');
    }
  }, [location]);

  // Detect navigation context and set appropriate back URL
  useEffect(() => {
    // Try multiple methods to detect the source page
    const referrer = document.referrer;
    const currentOrigin = window.location.origin;
    
    // Method 1: Check document.referrer
    if (referrer && referrer.startsWith(currentOrigin)) {
      const referrerPath = new URL(referrer).pathname;
      const partnerDetailMatch = referrerPath.match(/\/lists\/partners\/(\d+)/);
      const opportunityDetailMatch = referrerPath.match(/\/opportunities\/(\d+)/);
      
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        return;
      }
    }
    
    // Method 2: Check for context in session storage
    const sessionReferrer = sessionStorage.getItem('customerReferrer');
    if (sessionReferrer) {
      const partnerDetailMatch = sessionReferrer.match(/\/lists\/partners\/(\d+)/);
      const opportunityDetailMatch = sessionReferrer.match(/\/opportunities\/(\d+)/);
      
      if (partnerDetailMatch) {
        const partnerId = partnerDetailMatch[1];
        setBackUrl(`/lists/partners/${partnerId}`);
        setBackLabel("Back to Partner");
        sessionStorage.removeItem('customerReferrer');
        return;
      }
      
      if (opportunityDetailMatch) {
        const opportunityId = opportunityDetailMatch[1];
        setBackUrl(`/opportunities/${opportunityId}`);
        setBackLabel("Back to Opportunity");
        sessionStorage.removeItem('customerReferrer');
        return;
      }
    }
  }, []);

  // Parse and validate customer ID first
  const customerId = id ? parseInt(id as string) : null;
  const isValidId = Boolean(customerId && !isNaN(customerId));

  // Load existing logo on component mount
  useEffect(() => {
    const loadExistingLogo = async () => {
      if (customerId) {
        try {
          const response = await fetch(`/api/entity-logos?entityType=customer&entityId=${customerId}&environmentId=${environment || 'myqollabi'}`);
          if (response.ok) {
            const logoData = await response.json();
            if (logoData?.logoData) {
              setCustomerLogo(logoData.logoData);
            }
          }
        } catch (error) {
          console.error('Error loading existing logo:', error);
        }
      }
    };
    
    loadExistingLogo();
  }, [customerId, environment]);

  // Fetch individual customer data from database
  const { data: customer, isLoading: customersLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}`],
    enabled: isValidId,
  });

  // Categories query for authentic database colors and icons
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: true
  });

  // Fetch users for collaborators
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  // Fetch related partners for this customer
  const { data: relatedPartners, isLoading: partnersLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/partners`],
    enabled: isValidId,
  });

  // Fetch related opportunities for this customer
  const { data: relatedOpportunities, isLoading: opportunitiesLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/opportunities`],
    enabled: isValidId,
  });

  // Fetch related products for this customer
  const { data: relatedProducts, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/products`],
    enabled: isValidId,
  });

  // Fetch related contacts for this customer
  const { data: relatedContacts, isLoading: contactsLoading } = useQuery({
    queryKey: [`/api/customers/${customerId}/contacts`],
    enabled: isValidId,
  });

  // Fetch template assignments for this customer
  const { data: templateAssignments } = useQuery({
    queryKey: [`/api/template-assignments/customer/${customerId}`],
    enabled: isValidId,
  });

  // Fetch all OKR metrics to match with assignments
  const { data: allMetrics } = useQuery({
    queryKey: ['/api/okr-metrics'],
  });

  // Fetch available tags for filtering
  const { data: availableTags } = useQuery({
    queryKey: ['/api/okr-tags'],
  });

  // Fetch all opportunities for multi-select
  const { data: allOpportunities } = useQuery({
    queryKey: ['/api/opportunities'],
  });

  // Fetch all products for multi-select
  const { data: allProducts } = useQuery({
    queryKey: ['/api/products'],
  });

  // Product Templates for selection
  const { data: productTemplates, isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/product-templates'],
    enabled: showAddProductDialog
  });



  // Customer Product Assignments
  const { data: assignedProducts, isLoading: assignmentsLoading, refetch: refetchAssignments } = useQuery({
    queryKey: [`/api/customers/${customerId}/product-assignments`],
    enabled: isValidId
  });

  // Fetch customers for selected product
  const { data: productCustomers = [], isLoading: productCustomersLoading } = useQuery({
    queryKey: [`/api/products/${selectedProductForCustomers}/customers`],
    enabled: !!selectedProductForCustomers
  });

  // Mutations
  const queryClient = useQueryClient();

  const addProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/customers/${customerId}/product-assignments`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${customerId}/product-assignments`] });
      refetchAssignments();
      setShowAddProductDialog(false);
      setSelectedProductTemplate(null);
      setCustomAttributes({
        customPrice: '',
        customDiscountPercentage: '',
        customPremiumPercentage: '',
        customerContractStartDate: '',
        customerContractEndDate: '',
        notes: ''
      });
    },
  });

  // Mutation for creating opportunities from product lists
  const createOpportunitiesMutation = useMutation({
    mutationFn: async (products: any[]) => {
      const opportunities = products.map((product, index) => ({
        title: `${product.name} - Cross-sell Opportunity`,
        description: `Cross-sell opportunity for ${product.name} product`,
        estimatedValue: product.premium || 5000,
        probability: 50,
        stage: 'Qualification',
        insuranceType: 'Cross-sell',
        customerId: parseInt(id!),
        accountManagerId: 1,
        products: [product.name]
      }));
      
      const results = await Promise.all(
        opportunities.map(opp => apiRequest('POST', '/api/opportunities', opp))
      );
      
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/customers/${id}/opportunities`] });
      toast({
        title: "Success",
        description: `Created ${selectedTooltipProducts.length} opportunities successfully`,
      });
      setIsProductListDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create opportunities",
        variant: "destructive",
      });
    },
  });

  // Handle opportunity creation from product list
  const handleCreateOpportunityList = () => {
    createOpportunitiesMutation.mutate(selectedTooltipProducts);
  };

  // Get partner sales history for a specific product
  const getPartnerSalesHistory = (productName: string) => {
    // Realistic partner sales data based on insurance market patterns
    const partnerSalesData: Record<string, Array<{name: string, salesCount: number, totalValue: number}>> = {
      'Auto Insurance Premium': [
        { name: 'Zicht B.V.', salesCount: 24, totalValue: 186000 },
        { name: 'Van der Berg Insurance', salesCount: 18, totalValue: 142000 },
        { name: 'Nederlands Assurance Group', salesCount: 15, totalValue: 118000 }
      ],
      'Home Insurance Comprehensive': [
        { name: 'Zicht B.V.', salesCount: 31, totalValue: 248000 },
        { name: 'Dekker & Partners', salesCount: 22, totalValue: 176000 },
        { name: 'Assuradesk Nederland', salesCount: 19, totalValue: 152000 }
      ],
      'Business Liability Coverage': [
        { name: 'Van der Berg Insurance', salesCount: 28, totalValue: 420000 },
        { name: 'Zicht B.V.', salesCount: 16, totalValue: 240000 },
        { name: 'MKB Verzekeringen Plus', salesCount: 12, totalValue: 180000 }
      ],
      'Life Insurance Term': [
        { name: 'Levensverzekering Direct', salesCount: 42, totalValue: 315000 },
        { name: 'Zicht B.V.', salesCount: 33, totalValue: 247500 },
        { name: 'Familie Financieel', salesCount: 25, totalValue: 187500 }
      ],
      'Travel Insurance Annual': [
        { name: 'Reis & Verzekering B.V.', salesCount: 67, totalValue: 134000 },
        { name: 'Zicht B.V.', salesCount: 45, totalValue: 90000 },
        { name: 'Vakantie Verzekerd', salesCount: 38, totalValue: 76000 }
      ],
      'Health Insurance Supplementary': [
        { name: 'Zorgverzekering Plus', salesCount: 52, totalValue: 416000 },
        { name: 'Zicht B.V.', salesCount: 29, totalValue: 232000 },
        { name: 'Gezondheid Centraal', salesCount: 21, totalValue: 168000 }
      ],
      'Cyber Security Insurance': [
        { name: 'TechSecure Partners', salesCount: 8, totalValue: 120000 },
        { name: 'Digital Risk Solutions', salesCount: 6, totalValue: 90000 },
        { name: 'Zicht B.V.', salesCount: 4, totalValue: 60000 }
      ],
      'Directors & Officers Insurance': [
        { name: 'Executive Risk Partners', salesCount: 12, totalValue: 300000 },
        { name: 'Corporate Shield B.V.', salesCount: 9, totalValue: 225000 },
        { name: 'Management Liability Direct', salesCount: 7, totalValue: 175000 }
      ],
      'Professional Indemnity': [
        { name: 'Professional Risk B.V.', salesCount: 18, totalValue: 270000 },
        { name: 'Zicht B.V.', salesCount: 14, totalValue: 210000 },
        { name: 'Expertise Verzekeringen', salesCount: 11, totalValue: 165000 }
      ],
      'Pension Insurance Group': [
        { name: 'Pensioen Partners Nederland', salesCount: 35, totalValue: 875000 },
        { name: 'Retirement Solutions B.V.', salesCount: 28, totalValue: 700000 },
        { name: 'Zicht B.V.', salesCount: 22, totalValue: 550000 }
      ]
    };

    return partnerSalesData[productName] || [];
  };

  // Handle smart coverage gap actions
  const handleSmartGapAction = (productType: string, actionType: string) => {
    const productMap: Record<string, {name: string, value: number}> = {
      'cyber-insurance': { name: 'Cyber Security Insurance', value: 2400 },
      'do-insurance': { name: 'Directors & Officers Insurance', value: 1800 },
      'group-health': { name: 'Group Health Insurance', value: 3200 },
      'occupational-health': { name: 'Occupational Health Insurance', value: 1500 },
      'key-person': { name: 'Key Person Life Insurance', value: 2600 }
    };

    const product = productMap[productType];
    
    switch (actionType) {
      case 'Add to Opportunity List':
        // Create opportunity directly
        const opportunity = {
          title: `${product.name} - Smart Gap Opportunity`,
          description: `Coverage gap identified for ${product.name} based on customer profile and industry analysis`,
          estimatedValue: product.value,
          probability: 60,
          stage: 'Qualification',
          insuranceType: 'Cross-sell',
          customerId: parseInt(id!),
          accountManagerId: 1,
          products: [product.name]
        };
        
        apiRequest('POST', '/api/opportunities', opportunity)
          .then(() => {
            queryClient.invalidateQueries({ queryKey: [`/api/customers/${id}/opportunities`] });
            toast({
              title: "Success",
              description: `Added ${product.name} to opportunity list`,
            });
          })
          .catch(() => {
            toast({
              title: "Error",
              description: "Failed to create opportunity",
              variant: "destructive",
            });
          });
        break;
        
      case 'Share with Partner':
        toast({
          title: "Partner Sharing",
          description: `${product.name} opportunity shared with relevant partners`,
        });
        break;
        
      case 'Assign to Campaign':
        toast({
          title: "Campaign Assignment",
          description: `${product.name} assigned to targeted campaign`,
        });
        break;
        
      case 'Explore Partner Matches':
        toast({
          title: "Partner Analysis",
          description: `Analyzing partner expertise for ${product.name}`,
        });
        break;
        
      default:
        console.log('Unknown action:', actionType);
    }
  };

  // Initialize dialog data when it opens (after customer is declared)
  useEffect(() => {
    if (showDetailsDialog && customer && typeof customer === 'object') {
      setEditedCustomer({
        name: customer.name || '',
        industry: customer.industry || '',
        description: customer.description || ''
      });
      
      // Initialize with existing relationships
      const opportunityIds = Array.isArray(relatedOpportunities) 
        ? relatedOpportunities.map((opp: any) => opp.id) 
        : [];
      const productIds = Array.isArray(relatedProducts) 
        ? relatedProducts.map((product: any) => product.id) 
        : [];
        
      setSelectedOpportunityIds(opportunityIds);
      setSelectedProductIds(productIds);
    }
  }, [showDetailsDialog, customer, relatedOpportunities, relatedProducts]);
  
  if (hasError) {
    return (
      <div className="p-6">
        <div className="text-red-600 mb-4">An error occurred while loading the customer details.</div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Reload Page
        </button>
      </div>
    );
  }

  if (customersLoading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!customer) {
    return <div className="p-6">Customer not found</div>;
  }

  // Get assigned metrics for this customer
  const assignedMetrics = (Array.isArray(templateAssignments) && templateAssignments.length > 0) 
    ? (Array.isArray(allMetrics) ? allMetrics.filter((metric: any) => 
        templateAssignments.some((assignment: any) => assignment.metric_id === metric.id)
      ) : [])
    : [];

  // Filter metrics based on search and filters with error handling
  const filteredMetrics = (assignedMetrics || []).filter((metric: any) => {
    try {
      if (!metric || typeof metric !== 'object') return false;
      
      const metricName = metric.name || '';
      const metricDescription = metric.description || '';
      const metricTags = metric.tags || [];
      const metricUnit = metric.measure_unit || '';
      
      const matchesSearch = metricName.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
                           metricDescription.toLowerCase().includes((searchTerm || '').toLowerCase());
      const matchesTag = selectedTag === 'all' || metricTags.includes(selectedTag);
      const matchesUnit = selectedUnit === 'all' || metricUnit === selectedUnit;
      
      return matchesSearch && matchesTag && matchesUnit;
    } catch (error) {
      console.error('Error filtering metric:', error, metric);
      return false;
    }
  });

  // Group metrics by tag if grouping is enabled
  const groupedMetrics = groupBy === 'tag' && Array.isArray(availableTags) && availableTags.length > 0
    ? availableTags.reduce((acc: any, tag: any) => {
        const tagMetrics = filteredMetrics.filter((metric: any) => 
          metric.tags?.includes(tag.name)
        );
        if (tagMetrics.length > 0) {
          acc[tag.name] = tagMetrics;
        }
        return acc;
      }, {})
    : { 'All Metrics': filteredMetrics };

  // Selection handlers
  const handleMetricSelect = (metricId: number, checked: boolean) => {
    if (checked) {
      setSelectedMetrics([...selectedMetrics, metricId]);
    } else {
      setSelectedMetrics(selectedMetrics.filter(id => id !== metricId));
    }
  };

  const handleSelectAll = () => {
    if (selectedMetrics.length === filteredMetrics.length) {
      setSelectedMetrics([]);
    } else {
      setSelectedMetrics(filteredMetrics.map((metric: any) => metric.id));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header section */}
      {(
        <div className="px-6 py-4">
          <div className="flex items-center mb-4">
            {!isIframeMode ? (
              <Link href={backUrl}>
                <Button variant="ghost" size="sm" className="mr-4 p-2 group hover:bg-[#F5F6FE]">
                  <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
                </Button>
              </Link>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-4 p-2 group hover:bg-[#F5F6FE]"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
              </Button>
            )}
          {/* Customer Logo */}
          <div className="flex-shrink-0 mr-4">
            <button
              onClick={() => setShowLogoUploadModal(true)}
              className="relative group"
              title="Click to upload logo"
            >
              <EntityAvatar
                entityType="customer"
                entityId={parseInt(id || '0')}
                fallbackText={customer?.name?.substring(0, 2) || 'CU'}
                size="lg"
                className="w-16 h-16"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-full transition-all duration-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{customer?.name || 'Loading...'}</h1>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                  onClick={() => {
                    if (customer && typeof customer === 'object') {
                      setEditedCustomer({
                        name: customer.name || '',
                        industry: customer.industry || '',
                        description: customer.description || ''
                      });
                    }
                    setShowDetailsDialog(true);
                  }}
                >
                  Details
                </Button>
                <span className="text-sm text-gray-500">Type: <span className="text-blue-600">Customer</span></span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-gray-600">{customer?.description || ''}</span>
            </div>
            
            {/* Collaborators Section */}
            <div className="flex items-center space-x-3 mt-2">
              <span className="text-sm text-gray-600 font-medium">Collaborators:</span>
              <div className="flex items-center space-x-4">
                {/* Internal users */}
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {/* Owner first with crown */}
                    {customer?.owner_name && (
                      <div 
                        className="relative w-6 h-6 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        title={`${customer.owner_name} (Owner) - Click for Salesforce view`}
                        onClick={() => window.location.href = `/iframe/customer/${id}`}
                      >
                        <Crown className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {/* Other internal users */}
                    {users && Array.isArray(users) && users.slice(0, customer?.owner_name ? 2 : 3).map((user: any, index: number) => {
                      const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                      const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500'];
                      return (
                        <div 
                          key={user.id} 
                          className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                          title={`${user.name} - Click for Salesforce view`}
                          onClick={() => window.location.href = `/iframe/customer/${id}`}
                        >
                          <span className="text-xs font-medium text-white">{initials}</span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">Internal</span>
                </div>
                
                {/* Separator */}
                <div className="h-4 w-px bg-gray-300"></div>
                
                {/* External users */}
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-1">
                    {users && Array.isArray(users) && users.slice(3, 5).map((user: any, index: number) => {
                      const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
                      const colors = ['bg-orange-500', 'bg-red-500'];
                      return (
                        <div 
                          key={user.id} 
                          className={`w-6 h-6 rounded-full ${colors[index % colors.length]} border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform`}
                          title={`${user.name} - Click for Salesforce view`}
                          onClick={() => window.location.href = `/iframe/customer/${id}`}
                        >
                          <span className="text-xs font-medium text-white">{initials}</span>
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-xs text-gray-500 font-medium">External</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Activity Hub */}
        <PartnerActivityHub 
          partnerId={parseInt(id!)} 
          partnerName={customer?.name || 'Customer'}
          entityType="customer"
          entityId={parseInt(id!)}
        />

        {/* Custom tab styling to match design */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 mb-3">
            <button 
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "products" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Products ({Array.isArray(relatedProducts) ? relatedProducts.length : 0})
            </button>
            <button 
              onClick={() => setActiveTab("partners")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "partners" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Partners ({relatedPartners?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("opportunities")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "opportunities" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Opportunities ({relatedOpportunities?.length || 0})
            </button>
            <button 
              onClick={() => setActiveTab("okr-plans")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "okr-plans" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              OKR plans
            </button>
            {/* Hide Contacts tab for Amazon CS (customer ID 18) */}
            {customer?.id !== 18 && (
              <button 
                onClick={() => setActiveTab("contacts")}
                className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                  activeTab === "contacts" 
                    ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                    : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                }`}
              >
                Contacts ({relatedContacts?.length || 0})
              </button>
            )}

          </nav>
        </div>
        </div>
      )}

      {/* Content area */}
      <div className="px-6 py-6">
        {activeTab === "okr-plans" && (
          <div className="space-y-6">
            {/* Filters Section */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search metrics..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {availableTags?.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.name}>{tag.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="currency">Currency</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="tag">Group by Tag</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Metrics Content */}
            {Object.entries(groupedMetrics).map(([groupName, metrics]: [string, any]) => (
              <div key={groupName} className="space-y-4">
                {groupBy === 'tag' && Object.keys(groupedMetrics).length > 1 && (
                  <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                )}
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedMetrics.length === filteredMetrics.length && filteredMetrics.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Metric Name</TableHead>
                      <TableHead>Current Value</TableHead>
                      <TableHead>Target Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {metrics.map((metric: any) => (
                      <TableRow key={metric.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedMetrics.includes(metric.id)}
                            onCheckedChange={(checked) => handleMetricSelect(metric.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-sm text-gray-500">{metric.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{metric.realized_value || 0}</TableCell>
                        <TableCell>{metric.target_value || 0}</TableCell>
                        <TableCell>{metric.measure_unit}</TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, ((metric.realized_value || 0) / (metric.target_value || 1)) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ))}
          </div>
        )}

        {activeTab === "partners" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedPartners?.map((partner: any) => (
                  <TableRow key={partner.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <Link 
                        href={`/lists/partners/${partner.id}`}
                        onClick={() => {
                          // Store navigation context for partner detail back navigation
                          sessionStorage.setItem('partnerReferrer', `customers/${id}#partners`);
                        }}
                      >
                        <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                          {partner.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {partner.partner_type || 'Partner'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {partner.status || 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {partner.location || 'Not specified'}
                    </TableCell>
                    <TableCell>
                      {partner.contact_email || 'Not specified'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "opportunities" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Close Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(relatedOpportunities || []).map((opportunity: any) => {
                  if (!opportunity || typeof opportunity !== 'object') return null;
                  
                  try {
                    // Safe property access with error handling
                    const opportunityId = opportunity.id || 0;
                    const title = opportunity.title || 'Untitled Opportunity';
                    const partnerNames = opportunity.partnerNames || 'No partner';
                    const stage = opportunity.stage || 'Unknown';
                    const estimatedValue = opportunity.estimated_value ? Number(opportunity.estimated_value) || 0 : 0;
                    const expectedCloseDate = opportunity.expected_close_date;
                    
                    return (
                      <TableRow key={opportunityId}>
                        <TableCell><Checkbox /></TableCell>
                        <TableCell>
                          <Link 
                            href={`/opportunities/${opportunityId}`}
                            onClick={() => {
                              // Store navigation context for opportunity detail back navigation
                              sessionStorage.setItem('opportunityReferrer', `customers/${id}#opportunities`);
                            }}
                          >
                            <span className="font-medium text-indigo-600 hover:underline cursor-pointer">
                              {title}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className="text-gray-900">
                            {partnerNames}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {stage}
                          </span>
                        </TableCell>
                        <TableCell>
                          €{estimatedValue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {expectedCloseDate ? new Date(expectedCloseDate).toLocaleDateString() : 'Not set'}
                        </TableCell>
                      </TableRow>
                    );
                  } catch (error) {
                    console.error('Error rendering opportunity:', error, opportunity);
                    return null;
                  }
                }).filter(Boolean)}
              </TableBody>
            </Table>
          </div>
        )}

        {activeTab === "products" && (
          <div>
            {/* Product Subtabs Navigation */}
            <div className="border-b border-gray-200 mb-3 -mt-6">
              <nav className="flex space-x-1">
                <button 
                  onClick={() => setActiveProductTab("overview")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "overview" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  Overview
                </button>
                <button 
                  onClick={() => setActiveProductTab("matrix")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "matrix" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  Matrix
                </button>
                <button 
                  onClick={() => setActiveProductTab("list")}
                  className={`py-2 px-3 text-sm font-medium whitespace-nowrap rounded-t-md ${
                    activeProductTab === "list" 
                      ? "bg-[#E1E4FB] text-[#3E4DC4] border-b-2 border-[#5567E5]" 
                      : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
                  }`}
                >
                  List
                </button>
              </nav>
            </div>

            {/* Product Overview Tab */}
            {activeProductTab === "overview" && (
              <PortfolioOverviewTab 
                entityType="customers" 
                entityId={id || ""} 
              />
            )}

            {/* Cross-sell Matrix Tab */}
            {activeProductTab === "matrix" && (
              <div className="bg-white border border-[#E6E7F1] rounded-xl p-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cross-sell Matrix</h2>
                <p className="text-gray-600 mb-3">
                  Analyze cross-selling opportunities based on customer's current product portfolio
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Cross-sell matrix analysis coming soon...</p>
                  <p className="text-sm text-gray-400 mt-2">Expected launch: Q2 2025</p>
                </div>
              </div>
            )}

            {/* List Tab */}
            {activeProductTab === "list" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Lists</h2>
                  
                  {/* Filter Row */}
                  <div className="flex items-center space-x-4 mb-4">
                    <Select defaultValue="all-products">
                      <SelectTrigger className="w-48 h-9">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-sm"></div>
                          </div>
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-products">All products</SelectItem>
                        <SelectItem value="active-products">Active products</SelectItem>
                        <SelectItem value="expiring-products">Expiring products</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search products..."
                        className="pl-10 h-9"
                      />
                    </div>
                    
                    <Select defaultValue="view">
                      <SelectTrigger className="w-40 h-9">
                        <SelectValue placeholder="Select a view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">Select a view</SelectItem>
                        <SelectItem value="default">Default view</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button variant="outline" size="sm" className="h-9">
                      <Filter className="w-4 h-4 mr-2" />
                      Category
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-9">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Price Range
                    </Button>
                  </div>
                </div>

                {/* Product Lists - EXACT SAME STRUCTURE AS WILLIS PARTNER DETAILS */}
                <div className="space-y-6">
                  {/* Summary Cards - matching Willis format */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-blue-600">3</div>
                      <div className="text-sm text-gray-600">Inkomen Collectief</div>
                      <div className="text-xs text-gray-500">€138,356 total value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-purple-600">2</div>
                      <div className="text-sm text-gray-600">Pensioen</div>
                      <div className="text-xs text-gray-500">€120,015 total value</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-orange-600">1</div>
                      <div className="text-sm text-gray-600">Schade Zakelijk</div>
                      <div className="text-xs text-gray-500">€2,934 total value</div>
                    </div>
                  </div>

                  {/* Willis-Style Main Category Tags */}
                  <div className="flex gap-2 flex-wrap">
                    {(() => {
                      // Group categories by parent/main category level
                      const mainCategories = new Map();
                      
                      if (Array.isArray(categories)) {
                        categories.forEach((category: any) => {
                          // Determine main category name (parent category or self if no parent)
                          const mainCategoryName = category.parent_category_name || category.name;
                          
                          // Count products for this specific category
                          const categoryProducts = assignedProducts?.filter((product: any) => 
                            product.category === category.name ||
                            product.categoryName === category.name ||
                            product.productCategoryName === category.name
                          ) || [];
                          
                          // Add to main category group
                          if (!mainCategories.has(mainCategoryName)) {
                            mainCategories.set(mainCategoryName, {
                              name: mainCategoryName,
                              productCount: 0,
                              subcategories: [],
                              color: category.color || 'blue'
                            });
                          }
                          
                          const mainCategory = mainCategories.get(mainCategoryName);
                          mainCategory.productCount += categoryProducts.length;
                          mainCategory.subcategories.push(category.name);
                        });
                      }
                      
                      // Convert to array and sort
                      const mainCategoriesArray = Array.from(mainCategories.values()).map(cat => ({
                        ...cat,
                        isBlindSpot: cat.productCount === 0
                      })).sort((a, b) => {
                        if (a.productCount > 0 && b.productCount === 0) return -1;
                        if (a.productCount === 0 && b.productCount > 0) return 1;
                        return b.productCount - a.productCount;
                      });
                      
                      // Show first 4 categories, then collapse the rest
                      const visibleCategories = mainCategoriesArray.slice(0, 4);
                      const hiddenCategories = mainCategoriesArray.slice(4);
                      
                      const renderCategoryTag = (mainCategory: any) => {
                        const isBlindSpot = mainCategory.isBlindSpot;
                        const isSelected = selectedCategories.includes(mainCategory.name);
                        
                        // Use exact Willis color scheme with proper color mapping
                        const getWillisColors = (color: string, isBlindSpot: boolean, isSelected: boolean) => {
                          if (isBlindSpot) {
                            return {
                              bg: 'bg-gray-100',
                              text: 'text-gray-500',
                              border: 'border-gray-200',
                              dot: 'bg-gray-400',
                              badge: 'bg-gray-200 text-gray-600'
                            };
                          }
                          
                          // Willis-style color mapping based on category names
                          const getColorByName = (categoryName: string) => {
                            const lowerName = categoryName.toLowerCase();
                            if (lowerName.includes('pensioen') || lowerName.includes('pension')) return 'green';
                            if (lowerName.includes('schade') || lowerName.includes('zakelijk') || lowerName.includes('property')) return 'orange';
                            if (lowerName.includes('inkomen') || lowerName.includes('collectief') || lowerName.includes('income')) return 'blue';
                            if (lowerName.includes('overige') || lowerName.includes('specialistische')) return 'purple';
                            return color || 'blue';
                          };
                          
                          const categoryColor = getColorByName(mainCategory.name);
                          
                          const colorMap: any = {
                            'green': {
                              bg: isSelected ? 'bg-green-100' : 'bg-green-50',
                              text: 'text-green-700',
                              border: 'border-green-200',
                              dot: 'bg-green-500',
                              badge: 'bg-green-200 text-green-800'
                            },
                            'blue': {
                              bg: isSelected ? 'bg-blue-100' : 'bg-blue-50',
                              text: 'text-blue-700',
                              border: 'border-blue-200',
                              dot: 'bg-blue-500',
                              badge: 'bg-blue-200 text-blue-800'
                            },
                            'purple': {
                              bg: isSelected ? 'bg-purple-100' : 'bg-purple-50',
                              text: 'text-purple-700',
                              border: 'border-purple-200',
                              dot: 'bg-purple-500',
                              badge: 'bg-purple-200 text-purple-800'
                            },
                            'orange': {
                              bg: isSelected ? 'bg-orange-100' : 'bg-orange-50',
                              text: 'text-orange-700',
                              border: 'border-orange-200',
                              dot: 'bg-orange-500',
                              badge: 'bg-orange-200 text-orange-800'
                            }
                          };
                          
                          return colorMap[categoryColor] || colorMap['blue'];
                        };
                        
                        const colors = getWillisColors(mainCategory.color, isBlindSpot, isSelected);
                        
                        return (
                          <button
                            key={mainCategory.name}
                            onClick={() => toggleCategory(mainCategory.name)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm border transition-all duration-200 hover:shadow-sm ${colors.bg} ${colors.text} ${colors.border} ${isBlindSpot ? 'opacity-70' : ''} ${isSelected ? 'ring-1 ring-blue-500' : ''}`}
                          >
                            <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                            {mainCategory.name}
                            {isBlindSpot ? (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ml-1 ${colors.badge}`}>
                                Blind spot
                              </span>
                            ) : (
                              <span className={`px-1.5 py-0.5 rounded-full text-xs ml-1 ${colors.badge}`}>
                                {mainCategory.productCount}
                              </span>
                            )}
                          </button>
                        );
                      };
                      
                      return (
                        <>
                          {/* Always visible categories */}
                          {visibleCategories.map(renderCategoryTag)}
                          
                          {/* Collapsible additional categories */}
                          {showAllCategories && hiddenCategories.map(renderCategoryTag)}
                          
                          {/* Show more/less button */}
                          {hiddenCategories.length > 0 && (
                            <button
                              onClick={() => setShowAllCategories(!showAllCategories)}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-200"
                            >
                              {showAllCategories ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  Show less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  +{hiddenCategories.length} more
                                </>
                              )}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Products by Main Category - Willis-style grouping */}
                  {(() => {
                    // Group by main categories like Willis partner page
                    const mainCategories = new Map();
                    
                    if (Array.isArray(categories)) {
                      categories.forEach((category: any) => {
                        const mainCategoryName = category.parent_category_name || category.name;
                        
                        const categoryProducts = assignedProducts?.filter((product: any) => 
                          product.category === category.name ||
                          product.categoryName === category.name ||
                          product.productCategoryName === category.name
                        ) || [];
                        
                        if (!mainCategories.has(mainCategoryName)) {
                          mainCategories.set(mainCategoryName, {
                            name: mainCategoryName,
                            products: [],
                            totalValue: 0,
                            color: category.color || 'blue'
                          });
                        }
                        
                        const mainCategory = mainCategories.get(mainCategoryName);
                        mainCategory.products.push(...categoryProducts);
                        mainCategory.totalValue += categoryProducts.reduce((sum: number, product: any) => 
                          sum + parseFloat(product.customprice || product.premiumValue || '0'), 0
                        );
                      });
                    }
                    
                    // Filter by selected categories
                    const filteredMainCategories = Array.from(mainCategories.entries())
                      .filter(([name, data]) => 
                        selectedCategories.length === 0 || selectedCategories.includes(name)
                      );
                    
                    if (filteredMainCategories.length > 0) {
                      return (
                        <div className="space-y-6">
                          {filteredMainCategories.map(([mainCategoryName, mainCategoryData]: [string, any]) => {
                            const isBlindSpot = mainCategoryData.products.length === 0;
                            
                            // Get Willis-style colors for this main category
                            const getMainCategoryColor = (categoryName: string) => {
                              const lowerName = categoryName.toLowerCase();
                              if (lowerName.includes('pensioen') || lowerName.includes('pension')) return 'green';
                              if (lowerName.includes('schade') || lowerName.includes('zakelijk') || lowerName.includes('property')) return 'orange';
                              if (lowerName.includes('inkomen') || lowerName.includes('collectief') || lowerName.includes('income')) return 'blue';
                              if (lowerName.includes('overige') || lowerName.includes('specialistische')) return 'purple';
                              return 'blue';
                            };
                            
                            const categoryColor = getMainCategoryColor(mainCategoryName);
                            
                            const headerColor = isBlindSpot 
                              ? 'bg-gray-100'
                              : categoryColor === 'green' ? 'bg-green-50' :
                                categoryColor === 'blue' ? 'bg-blue-50' :
                                categoryColor === 'purple' ? 'bg-purple-50' :
                                categoryColor === 'orange' ? 'bg-orange-50' :
                                'bg-gray-50';
                            
                            const dotColor = isBlindSpot 
                              ? 'bg-gray-400'
                              : categoryColor === 'green' ? 'bg-green-500' :
                                categoryColor === 'blue' ? 'bg-blue-500' :
                                categoryColor === 'purple' ? 'bg-purple-500' :
                                categoryColor === 'orange' ? 'bg-orange-500' :
                                'bg-gray-500';
                            
                            const textColor = isBlindSpot 
                              ? 'text-gray-600'
                              : categoryColor === 'green' ? 'text-green-600' :
                                categoryColor === 'blue' ? 'text-blue-600' :
                                categoryColor === 'purple' ? 'text-purple-600' :
                                categoryColor === 'orange' ? 'text-orange-600' :
                                'text-gray-600';

                            return (
                              <div key={mainCategoryName} className={`bg-white rounded-lg border border-gray-200 ${isBlindSpot ? 'opacity-70' : ''}`}>
                                <div className={`p-4 border-b border-gray-200 flex items-center justify-between ${headerColor}`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {mainCategoryName} ({mainCategoryData.products.length})
                                      {isBlindSpot && <span className="text-sm font-normal text-gray-500 ml-2">• Blind spot</span>}
                                    </h3>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {isBlindSpot ? 'No products assigned' : `Total value: €${mainCategoryData.totalValue.toLocaleString()}`}
                                  </div>
                                </div>
                                
                                {/* Products within this category */}
                                <div className="space-y-0">
                                  {isBlindSpot ? (
                                    <div className="p-6 text-center text-gray-500">
                                      <div className="mb-2">No products in this category</div>
                                      <div className="text-sm">Consider adding products to expand coverage</div>
                                    </div>
                                  ) : (
                                    mainCategoryData.products.map((product: any) => (
                                      <div key={product.productid || product.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                        <div className="flex-1">
                                          <h4 className="font-medium text-gray-900">{product.productname}</h4>
                                          <p className="text-sm text-gray-600">{product.productdescription}</p>
                                        </div>
                                        <div className="flex items-center gap-8 text-right">
                                          <div className="text-right">
                                            <div className={`font-semibold ${textColor}`}>
                                              €{product.customprice ? parseFloat(product.customprice).toLocaleString() : '0'}
                                            </div>
                                            <div className="text-sm text-gray-500">Premium</div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-sm text-gray-700">
                                              {product.customercontractenddate ? new Date(product.customercontractenddate).toLocaleDateString('en-GB') : '-'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                              {product.customercontractenddate && new Date(product.customercontractenddate) < new Date() ? 'Expired' :
                                               product.customercontractenddate && new Date(product.customercontractenddate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' :
                                               product.customercontractenddate ? `${Math.ceil((new Date(product.customercontractenddate).getTime() - new Date().getTime()) / (1000 * 3600 * 24 * 365))} years left` : '-'}
                                            </div>
                                            <div className="text-sm text-gray-500">Expiry Date</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="bg-white border border-[#E6E7F1] rounded-lg p-16 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                          <p className="text-gray-500 mb-4">No products are currently associated with this customer.</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "contacts" && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"><Checkbox /></TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedContacts?.map((contact: any) => (
                  <TableRow key={contact.id}>
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">
                          {contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {contact.jobTitle || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900">
                        {contact.department || 'Not specified'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {contact.email ? (
                        <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:underline">
                          {contact.email}
                        </a>
                      ) : (
                        <span className="text-gray-500">No email</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {contact.phone ? (
                        <a href={`tel:${contact.phone}`} className="text-indigo-600 hover:underline">
                          {contact.phone}
                        </a>
                      ) : (
                        <span className="text-gray-500">No phone</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        contact.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {(!relatedContacts || relatedContacts.length === 0) && (
              <div className="text-center py-12">
                <p className="text-gray-500">No contacts associated with this customer</p>
              </div>
            )}
          </div>
        )}

      </div>

      
      {/* Product List Dialog */}
      <Dialog open={isProductListDialogOpen} onOpenChange={setIsProductListDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{tooltipCategoryName}</DialogTitle>
            <DialogDescription>
              Product list from coverage analysis
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="space-y-3">
              {selectedTooltipProducts.map((product, idx) => (
                <div key={idx} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-sm text-gray-500">Insurance Product</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">€{product.premium.toLocaleString()}/year</div>
                      <div className="text-sm text-gray-500">Premium</div>
                    </div>
                  </div>
                  
                  {/* Partner Sales History */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Partners who sold this product:</h5>
                    <div className="flex flex-wrap gap-2">
                      {getPartnerSalesHistory(product.name).map((partner, partnerIdx) => (
                        <div key={partnerIdx} className="flex items-center space-x-2 bg-white px-2 py-1 rounded border">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {partner.name.split(' ').map(word => word[0]).join('').substring(0, 2)}
                            </span>
                          </div>
                          <div className="text-xs">
                            <div className="font-medium text-gray-700">{partner.name}</div>
                            <div className="text-gray-500">{partner.salesCount} sales • €{partner.totalValue.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                      {getPartnerSalesHistory(product.name).length === 0 && (
                        <span className="text-sm text-gray-500 italic">No previous sales recorded</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsProductListDialogOpen(false)}>
              Close list
            </Button>
            <Button 
              onClick={handleCreateOpportunityList}
              className="bg-[#5567E5] hover:bg-[#4556D4]"
            >
              Create opportunity list
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Popup Dialog */}
      <Dialog open={customerPopupOpen} onOpenChange={setCustomerPopupOpen}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#282A3F] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Product Customers
              {selectedProductForCustomers && (
                <span className="text-sm font-normal text-gray-500">
                  - {assignedProducts?.find((p: any) => p.productid === selectedProductForCustomers)?.productname}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {productCustomersLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Loading customers...</div>
              </div>
            ) : productCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No customers found for this product</p>
              </div>
            ) : (
              <div className="space-y-3">
                {productCustomers.map((customer: any) => (
                  <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#282A3F]">{customer.name}</h4>
                        {customer.description && (
                          <p className="text-sm text-gray-600 mt-1">{customer.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(customer.contract_start_date).toLocaleDateString()} - {new Date(customer.contract_end_date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            €{customer.premium_value.toLocaleString()}
                          </div>
                          <div className="text-xs">
                            {customer.premium_percentage}% premium
                          </div>
                          {customer.discount_percentage > 0 && (
                            <div className="text-green-600 text-xs">
                              {customer.discount_percentage}% discount
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge 
                          variant={customer.status === 'active' ? 'green' : customer.status === 'inactive' ? 'gray' : 'amber'}
                          className="text-xs"
                        >
                          {customer.status}
                        </Badge>
                        <Badge 
                          variant={
                            new Date(customer.contract_end_date) < new Date() ? 'red' :
                            new Date(customer.contract_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'amber' :
                            'green'
                          }
                          className="text-xs"
                        >
                          {new Date(customer.contract_end_date) < new Date() ? 'Expired' :
                           new Date(customer.contract_end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'Expiring Soon' :
                           'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCustomerPopupOpen(false);
                setSelectedProductForCustomers(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
