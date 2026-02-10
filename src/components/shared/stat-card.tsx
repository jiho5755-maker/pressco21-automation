// 통계 카드 컴포넌트
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  trend?: {
    value: number; // 변화량 (백분율, 예: 5.2)
    direction: "up" | "down" | "neutral";
  };
}

export function StatCard({
  title,
  value,
  description,
  icon,
  variant = "default",
  trend,
}: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-green-500/50 bg-green-50 dark:bg-green-950/20",
    warning: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
    destructive: "border-red-500/50 bg-red-50 dark:bg-red-950/20",
  };

  const trendIcon = {
    up: <ArrowUp className="h-3 w-3" />,
    down: <ArrowDown className="h-3 w-3" />,
    neutral: <Minus className="h-3 w-3" />,
  };

  const trendColor = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  };

  return (
    <Card className={cn(variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trendColor[trend.direction]
              )}
            >
              {trendIcon[trend.direction]}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
