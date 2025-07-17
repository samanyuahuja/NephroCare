import { Card, CardContent } from "@/components/ui/card";

interface LIMEFeature {
  feature: string;
  impact: number;
  type: 'positive' | 'negative';
}

interface LIMEExplanationProps {
  features: LIMEFeature[];
}

export function LIMEExplanation({ features }: LIMEExplanationProps) {
  if (!features || features.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No LIME explanation available</p>
      </div>
    );
  }

  const getFeatureExplanation = (feature: string, impact: number) => {
    const absImpact = Math.abs(impact * 100);
    
    if (feature.includes('Creatinine')) {
      return impact > 0 ? 'High Creatinine Level' : 'Normal Creatinine Level';
    } else if (feature.includes('Hemoglobin')) {
      return impact > 0 ? 'Low Hemoglobin' : 'Normal Hemoglobin';
    } else if (feature.includes('Urea')) {
      return impact > 0 ? 'Elevated Blood Urea' : 'Normal Blood Urea';
    } else if (feature.includes('Age')) {
      return impact > 0 ? 'Advanced Age' : 'Younger Age';
    } else {
      return feature;
    }
  };

  const getBgColor = (impact: number) => {
    if (impact > 0.2) return 'bg-red-50 border-red-200';
    if (impact > 0.1) return 'bg-orange-50 border-orange-200';
    if (impact > 0) return 'bg-yellow-50 border-yellow-200';
    return 'bg-green-50 border-green-200';
  };

  const getTextColor = (impact: number) => {
    if (impact > 0.2) return 'text-red-600';
    if (impact > 0.1) return 'text-orange-600';
    if (impact > 0) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-3">
      {features.slice(0, 3).map((feature, index) => {
        const explanation = getFeatureExplanation(feature.feature, feature.impact);
        const riskChange = feature.impact * 100;
        
        return (
          <Card key={index} className={`${getBgColor(feature.impact)} border`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  {explanation}
                </span>
                <span className={`text-sm font-semibold ${getTextColor(feature.impact)}`}>
                  Risk {riskChange > 0 ? '+' : ''}{riskChange.toFixed(0)}%
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>LIME explains individual predictions by highlighting the most influential factors.</p>
      </div>
    </div>
  );
}
