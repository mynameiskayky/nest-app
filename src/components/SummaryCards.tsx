import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, DollarSignIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type SummaryCardsProps = {
  income: number;
  expenses: number;
};

export default function SummaryCards({ income, expenses }: SummaryCardsProps) {
  const total = income - expenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8">
      <SummaryCard
        title="Entradas"
        value={income}
        icon={
          <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
        }
        startColor="#0f766e"
        endColor="#10b981"
      />
      <SummaryCard
        title="Saídas"
        value={expenses}
        icon={<ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />}
        startColor="#9f1239"
        endColor="#f43f5e"
      />
      <SummaryCard
        title="Total"
        value={total}
        icon={
          <DollarSignIcon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
        }
        startColor="#1e40af"
        endColor="#3b82f6"
      />
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  startColor: string;
  endColor: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function SummaryCard({
  title,
  value,
  icon,
  startColor,
  endColor,
}: SummaryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (valueRef.current) {
      const duration = 2;
      const ease = "power3.out";

      gsap.to(valueRef.current, {
        duration,
        ease,
        innerText: value.toFixed(2),
        snap: { innerText: 0.01 },
        onUpdate: function () {
          const currentValue = parseFloat(this.targets()[0].innerText);
          valueRef.current!.innerText = formatCurrency(currentValue);
        },
      });

      gsap.fromTo(
        valueRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: duration / 2, ease }
      );

      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: duration / 2, ease }
      );
    }
  }, [value]);

  useEffect(() => {
    if (cardRef.current) {
      gsap.to(cardRef.current, {
        background: `linear-gradient(135deg, ${
          isHovered ? endColor + "15" : startColor + "10"
        }, ${isHovered ? startColor + "15" : endColor + "10"})`,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isHovered, startColor, endColor]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <Card
      ref={cardRef}
      className="text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-white/10 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-200 transition-colors">
          {title}
        </CardTitle>
        <div className="p-1 sm:p-2 rounded-full bg-white/10">{icon}</div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div
          className="text-xl sm:text-3xl font-bold text-gray-100 transition-colors"
          ref={valueRef}
        >
          {formatCurrency(0)}
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300" />
    </Card>
  );
}
