// 회사 공용 문서 카테고리 필터 컴포넌트
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { COMPANY_DOCUMENT_CATEGORIES } from "@/lib/constants";
import { companyDocumentCategoryConfig } from "@/lib/ui-config";

interface CompanyDocumentFiltersProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  documentCounts?: Record<string, number>;
}

export function CompanyDocumentFilters({
  selectedCategory,
  onCategoryChange,
  documentCounts = {},
}: CompanyDocumentFiltersProps) {
  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      onCategoryChange(null); // 토글: 선택 해제
    } else {
      onCategoryChange(category);
    }
  };

  const handleReset = () => {
    onCategoryChange(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          카테고리 필터
        </h3>
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs h-7"
          >
            <X className="h-3 w-3 mr-1" />
            초기화
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* 전체 버튼 */}
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="h-8"
        >
          전체
          {documentCounts["ALL"] !== undefined && (
            <Badge
              variant="outline"
              className="ml-2 border-gray-300 dark:border-gray-600"
            >
              {documentCounts["ALL"]}
            </Badge>
          )}
        </Button>

        {/* 카테고리별 버튼 */}
        {Object.entries(COMPANY_DOCUMENT_CATEGORIES).map(([key, label]) => {
          const config = companyDocumentCategoryConfig[key];
          const count = documentCounts[key] || 0;
          const isSelected = selectedCategory === key;

          return (
            <Button
              key={key}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(key)}
              className={`h-8 ${
                !isSelected && config?.className
                  ? `hover:${config.className.replace(/border-/g, "bg-").replace(/text-/g, "text-")}`
                  : ""
              }`}
            >
              {label}
              {count > 0 && (
                <Badge
                  variant="outline"
                  className="ml-2 border-gray-300 dark:border-gray-600"
                >
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
