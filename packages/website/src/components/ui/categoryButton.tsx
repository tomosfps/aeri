import { memo } from "react";
import { Button } from "./button";

export const CategoryButton = memo(({ 
    category, 
    isSelected, 
    onClick 
  }: { 
    category: string | null; 
    isSelected: boolean; 
    onClick: () => void;
  }) => {
    const isAll = category === null;
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${isAll ? 'border-cprimary-light' : 'border-csecondary-light'} bg-cbackground-light 
          hover:bg-${isAll ? 'cprimary' : 'csecondary'}-light/10 hover:text-ctext-light
          ${isSelected ? 
            `bg-${isAll ? 'cprimary' : 'csecondary'}-light text-cbackground-light hover:bg-${isAll ? 'cprimary' : 'csecondary'}-light/90` : 
            'text-ctext-light'}`}
        onClick={onClick}
      >
        {isAll ? 'All' : category}
      </Button>
    );
});