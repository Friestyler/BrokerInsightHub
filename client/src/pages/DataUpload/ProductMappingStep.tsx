import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { CategoryManagerForProducts } from '@/components/CategoryManagerForProducts';

interface ProductMappingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ProductMappingStep({ onNext, onBack }: ProductMappingStepProps) {
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Stap 1: Product Categorieën</h1>
            <p className="text-gray-600">Maak hoofdcategorieën en subcategorieën aan voor uw producten</p>
          </div>
        </div>
      </div>

      {/* Category Manager Component */}
      <CategoryManagerForProducts />

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Vorige Stap
        </Button>
        <Button
          onClick={onNext}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
        >
          Volgende Stap
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}