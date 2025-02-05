
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
}

const StatsCard = ({ title, value, icon: Icon }: StatsCardProps) => {
  return (
    <Card className="w-full h-full aspect-square flex flex-col items-center justify-center p-6 transition-all hover:scale-105">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <Icon className="w-16 h-16 text-muted-foreground mb-6" />
      <div className="text-4xl font-bold">{value}</div>
    </Card>
  );
};

export default StatsCard;