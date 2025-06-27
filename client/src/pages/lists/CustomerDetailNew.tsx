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
import { ArrowLeft, Search, Users, Copy, Trash2, MoreHorizontal, Package, ChevronDown, ChevronRight, Shield, TrendingUp, Clock, AlertTriangle, Target, Zap, Briefcase, Plane, PiggyBank, Scale, DollarSign, CheckCircle, ArrowUp } from "lucide-react";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import LogoUploadModal from "@/components/LogoUploadModal";
import EntityAvatar from "@/components/EntityAvatar";
import { useToast } from "@/hooks/use-toast";

export default function CustomerDetailNew() {
  const { id } = useParams();
  const { environment } = useEnvironment();
  const [location] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [backUrl, setBackUrl] = useState("/customers");
  const [backLabel, setBackLabel] = useState("Back to Customers");
  
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Life Insurance', 'Non-Life Insurance', 'Services']);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  
  // Tooltip and product list dialog state
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);
  const [isProductListDialogOpen, setIsProductListDialogOpen] = useState(false);
  const [selectedTooltipProducts, setSelectedTooltipProducts] = useState<any[]>([]);
  const [tooltipCategoryName, setTooltipCategoryName] = useState('');
  
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Get category info from database with fallback colors
  const getCategoryInfo = (categoryName: string) => {
    const dbCategory = categories?.find((cat: any) => cat.name === categoryName);
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
    if (showDetailsDialog && customer) {
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
  
  if (customersLoading) {
    return <div className="p-6">Loading...</div>;
  }
  
  if (!customer) {
    return <div className="p-6">Customer not found</div>;
  }

  // Get assigned metrics for this customer
  const assignedMetrics = templateAssignments?.length > 0 
    ? allMetrics?.filter((metric: any) => 
        templateAssignments.some((assignment: any) => assignment.metric_id === metric.id)
      ) || []
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
  const groupedMetrics = groupBy === 'tag' && availableTags?.length > 0
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
      <div className="px-6 py-4">
        <div className="flex items-center mb-4">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="mr-4 p-2 group hover:bg-[#F5F6FE]">
              <ArrowLeft className="w-4 h-4 group-hover:text-[#5567E5]" />
            </Button>
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded h-auto"
                  onClick={() => {
                    setEditedCustomer({
                      name: customer.name || '',
                      industry: customer.industry || '',
                      description: customer.description || ''
                    });
                    setShowDetailsDialog(true);
                  }}
                >
                  Details
                </Button>
                <span className="text-sm text-gray-500">Type: <span className="text-blue-600">Customer</span></span>
              </div>
            </div>
            <div className="mt-1">
              <span className="text-gray-600">{customer.description}</span>
            </div>
          </div>
        </div>
        


        {/* Custom tab styling to match design */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-2 mb-3">
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
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "products" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Products ({relatedProducts?.length || 0})
            </button>
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
            <button 
              onClick={() => setActiveTab("product-dashboard")}
              className={`py-2 px-4 text-sm font-medium whitespace-nowrap rounded-md ${
                activeTab === "product-dashboard" 
                  ? "bg-[#E1E4FB] text-[#3E4DC4]" 
                  : "text-[#696C8C] hover:bg-[#F5F6FE] hover:text-[#5567E5]"
              }`}
            >
              Product dashboard
            </button>
          </nav>
        </div>
      </div>

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
            {/* Add Product Button */}
            <div className="flex justify-end items-center mb-4">
              <Button 
                disabled
                className="bg-gray-300 text-gray-500 cursor-not-allowed h-8"
              >
                Add product
              </Button>
            </div>

            {/* 2. Policies Requiring Attention - Timeline Strip */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Policies Requiring Attention</h2>
              
              <div className="space-y-4">
                {/* Critical Priority - 19 days left */}
                <div className="relative pl-8 pb-4 border-l-4 border-red-500">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Auto Insurance - Policy #AI-2024-003</h3>
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            🔴 19 days left
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Expires:</span> January 15, 2025
                          </div>
                          <div>
                            <span className="font-medium">Current Premium:</span> €840/year
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span> Allianz Belgium
                          </div>
                          <div>
                            <span className="font-medium">Upgrade Potential:</span> +€280/year
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Suggested Actions:</span>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200">
                            Add to Campaign
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200">
                            Create Opportunity
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* High Priority - 45 days left */}
                <div className="relative pl-8 pb-4 border-l-4 border-orange-500">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Home Insurance - Policy #HI-2024-007</h3>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            🟡 45 days left
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Expires:</span> February 10, 2025
                          </div>
                          <div>
                            <span className="font-medium">Current Premium:</span> €1,200/year
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span> KBC Insurance
                          </div>
                          <div>
                            <span className="font-medium">Upgrade Potential:</span> +€480/year
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Suggested Actions:</span>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200">
                            Add to Campaign
                          </button>
                          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium hover:bg-green-200">
                            Schedule Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medium Priority - Upgrade Opportunity */}
                <div className="relative pl-8 pb-4 border-l-4 border-blue-500">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Health Insurance - Policy #HI-2023-012</h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            💼 Upgrade Available
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Next Review:</span> March 2025
                          </div>
                          <div>
                            <span className="font-medium">Current Premium:</span> €960/year
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span> Ethias Insurance
                          </div>
                          <div>
                            <span className="font-medium">Upgrade Potential:</span> +€320/year
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Suggested Actions:</span>
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-200">
                            Add to Campaign
                          </button>
                          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium hover:bg-purple-200">
                            Prepare Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Low Priority - Future Opportunity */}
                <div className="relative pl-8 border-l-4 border-gray-400">
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">Life Insurance - Policy #LI-2023-005</h3>
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            📅 Future Review
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Next Review:</span> June 2025
                          </div>
                          <div>
                            <span className="font-medium">Current Premium:</span> €1,440/year
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span> AG Insurance
                          </div>
                          <div>
                            <span className="font-medium">Upgrade Potential:</span> +€240/year
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="text-gray-600">Suggested Actions:</span>
                          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200">
                            Monitor
                          </button>
                          <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium hover:bg-yellow-200">
                            Plan Review
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-gray-900">Priority Actions</h4>
                    <p className="text-sm text-gray-600">2 critical renewals, 2 upgrade opportunities</p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                      Create Campaign
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Export List
                    </button>
                  </div>
                </div>
              </div>
            </div>
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

        {activeTab === "product-dashboard" && (
          <div className="space-y-6 overflow-visible">
            <>
            {/* Coverage Overview by Category - Horizontal Bar Chart */}
            <div className="bg-white border border-[#E6E7F1] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Coverage Overview by Category</h2>
                
                {/* Filter Controls */}
                <div className="flex items-center space-x-3">
                  {/* Multi-select Category Filter */}
                  <div className="relative">
                    <button 
                      className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between min-w-[200px]"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                      <span className="text-gray-700">
                        {selectedCategories.length === 0 ? 'All categories' : 
                         selectedCategories.length === 1 ? selectedCategories[0] :
                         `${selectedCategories.length} categories selected`}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {categoryDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                          {/* Main Categories */}
                          <div className="space-y-1">
                            <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedCategories.includes('Life Insurance')}
                                onChange={() => toggleCategory('Life Insurance')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span className="text-sm font-medium text-gray-900">Life Insurance</span>
                            </label>
                            
                            {/* Life Insurance Subcategories */}
                            <div className="ml-6 space-y-1">
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Death Cover')}
                                  onChange={() => toggleCategory('Death Cover')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Death Cover</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Branch 21')}
                                  onChange={() => toggleCategory('Branch 21')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Branch 21</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Branch 23')}
                                  onChange={() => toggleCategory('Branch 23')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Branch 23</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Group Insurance')}
                                  onChange={() => toggleCategory('Group Insurance')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Group Insurance</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Pension Savings')}
                                  onChange={() => toggleCategory('Pension Savings')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Pension Savings</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedCategories.includes('Non-Life Insurance')}
                                onChange={() => toggleCategory('Non-Life Insurance')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <div className="w-3 h-3 bg-orange-500 rounded"></div>
                              <span className="text-sm font-medium text-gray-900">Non-Life Insurance</span>
                            </label>
                            
                            {/* Non-Life Insurance Subcategories */}
                            <div className="ml-6 space-y-1">
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Health')}
                                  onChange={() => toggleCategory('Health')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Health</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Mobility')}
                                  onChange={() => toggleCategory('Mobility')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Mobility</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Property & Liability')}
                                  onChange={() => toggleCategory('Property & Liability')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Property & Liability</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Business')}
                                  onChange={() => toggleCategory('Business')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Business</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Travel')}
                                  onChange={() => toggleCategory('Travel')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Travel</span>
                              </label>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={selectedCategories.includes('Services')}
                                onChange={() => toggleCategory('Services')}
                                className="w-4 h-4 text-blue-600"
                              />
                              <div className="w-3 h-3 bg-purple-500 rounded"></div>
                              <span className="text-sm font-medium text-gray-900">Services</span>
                            </label>
                            
                            {/* Services Subcategories */}
                            <div className="ml-6 space-y-1">
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Legal Services')}
                                  onChange={() => toggleCategory('Legal Services')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Legal Services</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('HR Consulting')}
                                  onChange={() => toggleCategory('HR Consulting')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">HR Consulting</span>
                              </label>
                              <label className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={selectedCategories.includes('Financial Advisory')}
                                  onChange={() => toggleCategory('Financial Advisory')}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-600">Financial Advisory</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 p-2">
                          <button 
                            onClick={() => {
                              setSelectedCategories(['Life Insurance', 'Non-Life Insurance', 'Services']);
                              setCategoryDropdownOpen(false);
                            }}
                            className="w-full text-sm text-blue-600 hover:text-blue-700 py-1"
                          >
                            Reset to default (3 categories)
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <select className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All products</option>
                    <option>Death Cover</option>
                    <option>Auto Insurance</option>
                    <option>Health Insurance</option>
                    <option>Home Insurance</option>
                  </select>
                  
                  <select className="h-9 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All price ranges</option>
                    <option>€0 - €500</option>
                    <option>€500 - €1,000</option>
                    <option>€1,000 - €2,000</option>
                    <option>€2,000+</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-6 overflow-visible">
                {/* Filtered Categories */}
                {getFilteredCategories().map((category, index) => (
                  <div key={category.name} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderCategoryBadge(category)}
                      </div>
                      <div className="text-sm text-gray-600">{category.covered} of {category.total} products ({category.percentage}%)</div>
                    </div>
                  
                    <div className="relative mb-20">
                      <div className="flex h-10 bg-gray-100/60 backdrop-blur-sm rounded-xl overflow-visible cursor-pointer border border-gray-200/50 shadow-sm">
                        {category.percentage > 0 && (
                          <div 
                            className={`${getBarGradientClasses(category.color)} flex items-center justify-center text-white text-xs font-medium transition-all duration-300 relative group rounded-l-xl shadow-sm`}
                            style={{ 
                              width: '0%',
                              animation: `growBar-${index} 1.5s ease-out ${index * 0.3}s forwards`
                            }}
                            onMouseEnter={() => setHoveredTooltip(`${category.name}-covered`)}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            <style dangerouslySetInnerHTML={{
                              __html: `
                                @keyframes growBar-${index} {
                                  from { width: 0%; }
                                  to { width: ${category.percentage}%; }
                                }
                              `
                            }} />
                            <span className="drop-shadow-sm">{category.percentage}% Covered</span>
                          </div>
                        )}
                        
                        {(100 - category.percentage) > 0 && (
                          <div 
                            className="bg-gray-200/40 flex items-center justify-center text-gray-600 text-xs font-medium transition-all duration-300 relative group rounded-r-xl"
                            style={{ width: `${100 - category.percentage}%` }}
                            onMouseEnter={() => setHoveredTooltip(`${category.name}-available`)}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            <span className="drop-shadow-sm">{100 - category.percentage}% Not Covered</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tooltip - Covered Products */}
                      {hoveredTooltip === `${category.name}-covered` && (
                        <div 
                          className={`absolute left-0 top-full mt-2 z-50 w-72 p-0 bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 pointer-events-auto overflow-hidden opacity-100 visible`}
                          onMouseEnter={() => setHoveredTooltip(`${category.name}-covered`)}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          <div className={`h-1 ${category.name === 'Life Insurance' ? 'bg-green-500' : category.name === 'Non-Life Insurance' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 mb-3 text-lg">{category.name} - Covered Products</h4>
                            <div className="space-y-2 text-sm">
                              {category.coveredProducts && category.coveredProducts.length > 0 ? (
                                category.coveredProducts.map((product: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-gray-700">{product.name}</span>
                                    <span className={`font-semibold ${
                                      category.color === 'green' ? 'text-green-600' :
                                      category.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
                                    }`}>€{product.premium.toLocaleString()}/year</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 italic">No covered products</div>
                              )}
                              <hr className="my-3 border-gray-200/50" />
                              <div className="flex justify-between items-center font-semibold mb-3">
                                <span className="text-gray-900">Total Coverage</span>
                                <span className={`${
                                  category.color === 'green' ? 'text-green-600' :
                                  category.color === 'orange' ? 'text-orange-600' : 'text-gray-600'
                                }`}>€{category.currentPremium.toLocaleString()}/year</span>
                              </div>
                              <Button 
                                onClick={() => {
                                  setSelectedTooltipProducts(category.coveredProducts || []);
                                  setTooltipCategoryName(`${category.name} - Covered Products`);
                                  setIsProductListDialogOpen(true);
                                  setHoveredTooltip(null);
                                }}
                                className="w-full h-8 text-sm"
                                variant="outline"
                              >
                                See list
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Tooltip - Available Products */}
                      {hoveredTooltip === `${category.name}-available` && (
                        <div 
                          className={`absolute left-0 top-full mt-2 z-50 w-72 p-0 bg-white/90 backdrop-blur-md border border-white/20 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] transition-all duration-200 pointer-events-auto overflow-hidden opacity-100 visible`}
                          onMouseEnter={() => setHoveredTooltip(`${category.name}-available`)}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          <div className={`h-1 ${category.name === 'Life Insurance' ? 'bg-green-500' : category.name === 'Non-Life Insurance' ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                          <div className="p-4">
                            <h4 className="font-bold text-gray-900 mb-3 text-lg">{category.name} - Available Products</h4>
                            <div className="space-y-2 text-sm">
                              {category.availableProducts && category.availableProducts.length > 0 ? (
                                category.availableProducts.map((product: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-gray-700">{product.name}</span>
                                    <span className="text-gray-600 font-semibold">€{product.premium.toLocaleString()}/year</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-gray-500 italic">No available products</div>
                              )}
                              <hr className="my-3 border-gray-200/50" />
                              <div className="flex justify-between items-center font-semibold mb-3">
                                <span className="text-gray-900">Potential Value</span>
                                <span className="text-green-600">€{category.potentialPremium.toLocaleString()}/year</span>
                              </div>
                              <Button 
                                onClick={() => {
                                  setSelectedTooltipProducts(category.availableProducts || []);
                                  setTooltipCategoryName(`${category.name} - Available Products`);
                                  setIsProductListDialogOpen(true);
                                  setHoveredTooltip(null);
                                }}
                                className="w-full h-8 text-sm"
                                variant="outline"
                              >
                                See list
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                        
                        {(100 - category.percentage) > 0 && (
                          <div 
                            className="bg-gray-200/40 flex items-center justify-center text-gray-600 text-xs font-medium transition-all duration-300 relative group rounded-r-xl"
                            style={{ width: `${100 - category.percentage}%` }}
                            onMouseEnter={() => setHoveredTooltip(`${category.name}-available`)}
                            onMouseLeave={() => setHoveredTooltip(null)}
                          >
                            <span className="drop-shadow-sm">{100 - category.percentage}% Not Covered</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
            
            <div className="mb-16 bg-white/80 backdrop-blur-lg rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-8 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] transition-shadow duration-500">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Smart Coverage Gaps</h2>
              <p className="text-gray-600 text-sm">AI-identified expansion opportunities based on customer profile analysis</p>
            </div>
            
            {/* Smart Coverage Gaps content */}
            <div className="space-y-6">
              {/* Coverage Gap Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    High Priority
                  </span>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">+€2,400/year</div>
                    <div className="text-xs text-gray-500">Estimated Value</div>
                  </div>
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">Cyber Security Insurance</h5>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Critical gap for engineering firms. Required for EU compliance and often bundled with Professional Indemnity
                </p>
                <button className="w-full bg-[#5567E5] hover:bg-[#4556D4] text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
                  Add to Opportunity List
                </button>
              </div>
            </div>
          </div>

          {/* Time-Sensitive Actions & Events */}
          <div className="mb-16 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)] transition-shadow duration-500">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Time-Sensitive Actions & Events</h2>
              <p className="text-gray-600 text-sm">Urgent triggers requiring immediate attention due to upcoming renewals or regulatory deadlines</p>
            </div>
            
            {/* Time-Sensitive Action Card */}
            <div className="bg-white border-l-4 border-red-500 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-800">
                    EXPIRING SOON
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Cyber Security Policy</h3>
                  <p className="text-sm text-gray-600 mb-2">Policy expires in 12 days - critical for EU compliance requirements</p>
                  <div className="flex items-center space-x-6 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium text-red-600">12 days left</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-3 h-3" />
                      <span>€3,200 at risk</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 bg-[#5567E5] hover:bg-[#4556D4] text-white text-xs font-medium rounded-md transition-colors">
                  Add to Campaign
                </button>
                <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors">
                  Share with Partner
                </button>
              </div>
            </div>
          </div>
        </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
}
