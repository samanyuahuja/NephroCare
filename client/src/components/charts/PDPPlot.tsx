import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CKDAssessment } from "@shared/schema";

interface PDPPlotProps {
  assessment: CKDAssessment;
}

interface FeatureConfig {
  name: string;
  key: keyof CKDAssessment;
  unit: string;
  minValue: number;
  maxValue: number;
  getValue: (assessment: CKDAssessment) => number;
}

const FEATURE_OPTIONS: FeatureConfig[] = [
  {
    name: "Serum Creatinine",
    key: "serumCreatinine", 
    unit: "mg/dL",
    minValue: 0.5,
    maxValue: 4.0,
    getValue: (a) => Number(a.serumCreatinine) || 1.2
  },
  {
    name: "Blood Urea",
    key: "bloodUrea",
    unit: "mg/dL", 
    minValue: 10,
    maxValue: 80,
    getValue: (a) => Number(a.bloodUrea) || 35
  },
  {
    name: "Age",
    key: "age",
    unit: "years",
    minValue: 20,
    maxValue: 80,
    getValue: (a) => Number(a.age) || 45
  },
  {
    name: "Blood Pressure",
    key: "bloodPressure", 
    unit: "mmHg",
    minValue: 90,
    maxValue: 200,
    getValue: (a) => Number(a.bloodPressure) || 120
  },
  {
    name: "Hemoglobin",
    key: "hemoglobin",
    unit: "g/dL",
    minValue: 6,
    maxValue: 18,
    getValue: (a) => Number(a.hemoglobin) || 12
  },
  {
    name: "Blood Glucose",
    key: "bloodGlucoseRandom",
    unit: "mg/dL",
    minValue: 70,
    maxValue: 300,
    getValue: (a) => Number(a.bloodGlucoseRandom) || 140
  },
  {
    name: "Albumin",
    key: "albumin",
    unit: "g/L",
    minValue: 0,
    maxValue: 5,
    getValue: (a) => Number(a.albumin) || 1
  },
  {
    name: "Sodium",
    key: "sodium",
    unit: "mEq/L",
    minValue: 120,
    maxValue: 160,
    getValue: (a) => Number(a.sodium) || 140
  },
  {
    name: "Potassium",
    key: "potassium",
    unit: "mEq/L",
    minValue: 3.0,
    maxValue: 6.0,
    getValue: (a) => Number(a.potassium) || 4.5
  },
  {
    name: "WBC Count",
    key: "wbcCount",
    unit: "cells/cmm",
    minValue: 4000,
    maxValue: 15000,
    getValue: (a) => Number(a.wbcCount) || 7500
  },
  {
    name: "RBC Count",
    key: "rbcCount",
    unit: "millions/cmm",
    minValue: 3.0,
    maxValue: 6.0,
    getValue: (a) => Number(a.rbcCount) || 5.0
  }
];

export function PDPPlot({ assessment }: PDPPlotProps) {
  const [selectedFeature, setSelectedFeature] = useState<FeatureConfig>(FEATURE_OPTIONS[0]);
  
  const feature = selectedFeature.name;
  const value = selectedFeature.getValue(assessment);
  const unit = selectedFeature.unit;
  // Generate PDP data points based on medical relationships
  const generatePDPData = () => {
    const points = [];
    const { minValue, maxValue } = selectedFeature;
    const step = (maxValue - minValue) / 25;
    
    for (let i = 0; i <= 25; i++) {
      const x = minValue + (i * step);
      let y;
      
      switch (selectedFeature.name) {
        case 'Serum Creatinine':
          // Sigmoid curve - sharp increase after 1.5 mg/dL
          y = 1 / (1 + Math.exp(-4 * (x - 1.5))) * 95;
          break;
          
        case 'Blood Urea':
          // Gradual increase, steeper after 40 mg/dL
          y = x < 25 ? 5 + x * 0.4 : 15 + (x - 25) * 1.2;
          y = Math.min(y, 95);
          break;
          
        case 'Age':
          // Linear increase with age, steeper after 60
          y = x < 60 ? 5 + x * 0.3 : 20 + (x - 60) * 1.5;
          y = Math.min(y, 90);
          break;
          
        case 'Blood Pressure':
          // Gradual increase, steeper after 140 mmHg
          y = x < 140 ? 5 + (x - 90) * 0.2 : 15 + (x - 140) * 0.8;
          y = Math.min(y, 85);
          break;
          
        case 'Hemoglobin':
          // Inverse relationship - lower hemoglobin = higher risk
          y = Math.max(5, 80 - (x - 6) * 6);
          break;
          
        case 'Blood Glucose':
          // Gradual increase, steeper after 180 mg/dL
          y = x < 180 ? 5 + (x - 70) * 0.15 : 20 + (x - 180) * 0.4;
          y = Math.min(y, 90);
          break;

        case 'Albumin':
          // Higher albumin in urine = higher CKD risk
          y = x < 1 ? 5 + x * 2 : 7 + (x - 1) * 15;
          y = Math.min(y, 85);
          break;

        case 'Sodium':
          // Abnormal sodium levels increase risk
          if (x < 135 || x > 145) {
            y = 15 + Math.abs(x - 140) * 2;
          } else {
            y = 5;
          }
          y = Math.min(y, 80);
          break;

        case 'Potassium':
          // Abnormal potassium levels increase risk
          if (x < 3.5 || x > 5.0) {
            y = 15 + Math.abs(x - 4.25) * 8;
          } else {
            y = 5;
          }
          y = Math.min(y, 75);
          break;

        case 'WBC Count':
          // High WBC count increases risk
          y = x < 10000 ? 5 + (x - 4000) * 0.001 : 11 + (x - 10000) * 0.004;
          y = Math.min(y, 70);
          break;

        case 'RBC Count':
          // Low RBC count increases risk
          y = Math.max(5, 50 - (x - 3) * 15);
          break;
          
        default:
          y = Math.min(x * 0.5, 95);
      }
      
      points.push({ x, y: Math.max(0, y) });
    }
    return points;
  };

  const data = generatePDPData();
  const userPoint = data.find(p => Math.abs(p.x - value) < (selectedFeature.maxValue - selectedFeature.minValue) / 25) || 
                   { x: value, y: data[Math.floor(data.length / 2)].y };

  return (
    <div className="space-y-4">
      {/* Feature Selection Dropdown */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Select Feature:</label>
        <Select 
          value={selectedFeature.name} 
          onValueChange={(featureName) => {
            const newFeature = FEATURE_OPTIONS.find(f => f.name === featureName);
            if (newFeature) setSelectedFeature(newFeature);
          }}
        >
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FEATURE_OPTIONS.map((option) => (
              <SelectItem key={option.name} value={option.name}>
                {option.name} ({option.unit})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
            <span>{selectedFeature.minValue}</span>
            <span>{((selectedFeature.minValue + selectedFeature.maxValue) / 2).toFixed(0)}</span>
            <span>{selectedFeature.maxValue}</span>
          </div>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-600">
        <p className="font-medium">{feature} vs CKD Probability</p>
        <p>Your value: <span className="text-red-600 font-semibold">{typeof value === 'number' ? value.toFixed(1) : value} {unit}</span></p>
        <p>Predicted risk at your value: <span className="text-red-600 font-semibold">{userPoint.y.toFixed(1)}%</span></p>
      </div>
    </div>
  );
}
