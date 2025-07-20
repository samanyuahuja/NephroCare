import { Progress } from "@/components/ui/progress";

interface SHAPFeature {
  feature: string;
  impact: number;
  type: 'positive' | 'negative';
}

interface SHAPPlotProps {
  features: SHAPFeature[];
}

export function SHAPPlot({ features }: SHAPPlotProps) {
  if (!features || features.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No SHAP features available</p>
      </div>
    );
  }

  // Limit to top 5 features only
  const topFeatures = features
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      {topFeatures.map((feature, index) => {
        const absImpact = Math.abs(feature.impact);
        const maxImpact = Math.max(...topFeatures.map(f => Math.abs(f.impact)));
        const percentage = (absImpact / maxImpact) * 100;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 font-medium">{feature.feature}</span>
              <span className={`font-semibold ${
                feature.type === 'negative' ? 'text-red-600' : 'text-green-600'
              }`}>
                {feature.impact > 0 ? '+' : ''}{(feature.impact * 100).toFixed(1)}%
              </span>
            </div>
            <div className="relative">
              <Progress 
                value={percentage} 
                className={`h-4 shap-bar ${
                  feature.type === 'negative' ? 'shap-positive' : 'shap-negative'
                }`}
              />
            </div>
          </div>
        );
      })}
      <div className="mt-4 text-xs text-gray-500">
        <p>Red bars indicate factors increasing CKD risk</p>
        <p>Green bars indicate protective factors</p>
      </div>
    </div>
  );
}
