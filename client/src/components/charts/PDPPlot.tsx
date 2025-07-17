import { TrendingUp } from "lucide-react";

interface PDPPlotProps {
  feature: string;
  value: number;
  unit?: string;
}

export function PDPPlot({ feature, value, unit = "" }: PDPPlotProps) {
  // Generate mock PDP data points
  const generatePDPData = () => {
    const points = [];
    const minValue = feature.includes('Creatinine') ? 0.5 : 0;
    const maxValue = feature.includes('Creatinine') ? 3.0 : 100;
    const step = (maxValue - minValue) / 20;
    
    for (let i = 0; i <= 20; i++) {
      const x = minValue + (i * step);
      // Sigmoid-like curve for creatinine relationship to CKD probability
      let y;
      if (feature.includes('Creatinine')) {
        y = 1 / (1 + Math.exp(-5 * (x - 1.2))) * 100;
      } else {
        y = Math.min(x * 0.8, 95);
      }
      points.push({ x, y });
    }
    return points;
  };

  const data = generatePDPData();
  const userPoint = data.find(p => Math.abs(p.x - value) < 0.1) || 
                   { x: value, y: feature.includes('Creatinine') ? 
                     1 / (1 + Math.exp(-5 * (value - 1.2))) * 100 : value * 0.8 };

  return (
    <div className="space-y-4">
      <div className="relative h-48 bg-gray-100 rounded-lg p-4">
        {/* Chart area */}
        <div className="relative w-full h-full">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>
          
          {/* Chart content */}
          <div className="ml-8 mr-4 h-full relative">
            {/* Grid lines */}
            <div className="absolute inset-0">
              {[0, 25, 50, 75, 100].map((y) => (
                <div 
                  key={y}
                  className="absolute w-full border-t border-gray-200"
                  style={{ bottom: `${y}%` }}
                />
              ))}
            </div>
            
            {/* Curve simulation */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d={`M 0,${192 - (data[0].y / 100) * 192} ${data.map((point, i) => 
                  `L ${(i / (data.length - 1)) * 100}%,${192 - (point.y / 100) * 192}`
                ).join(' ')}`}
                stroke="#3B82F6"
                strokeWidth="2"
                fill="none"
                vectorEffect="non-scaling-stroke"
              />
              
              {/* User point */}
              <circle
                cx={`${((value - data[0].x) / (data[data.length - 1].x - data[0].x)) * 100}%`}
                cy={192 - (userPoint.y / 100) * 192}
                r="4"
                fill="#EF4444"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
          
          {/* X-axis labels */}
          <div className="absolute bottom-0 left-8 right-4 flex justify-between text-xs text-gray-500 mt-2">
            <span>{data[0].x.toFixed(1)}</span>
            <span>{data[Math.floor(data.length/2)].x.toFixed(1)}</span>
            <span>{data[data.length-1].x.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p className="font-medium">{feature} vs CKD Probability</p>
        <p>Your value: <span className="text-red-600 font-semibold">{value} {unit}</span></p>
        <p>Predicted risk: <span className="text-red-600 font-semibold">{userPoint.y.toFixed(1)}%</span></p>
      </div>
    </div>
  );
}
