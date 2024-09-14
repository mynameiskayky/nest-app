import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, TrendingUpIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type SummaryCardsProps = {
  income: number;
  expenses: number;
};

export default function SummaryCards({ income, expenses }: SummaryCardsProps) {
  const total = income - Math.abs(expenses);
  const balance = useRef(0);

  useEffect(() => {
    balance.current = total;
  }, [total]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 sm:mb-8 w-full">
      <SummaryCard
        title="Entradas"
        value={income}
        icon={
          <ArrowUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
        }
        startColor="#0f766e"
        endColor="#10b981"
        trend={income > balance.current ? "up" : "down"}
      />
      <SummaryCard
        title="Saídas"
        value={Math.abs(expenses)}
        icon={<ArrowDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />}
        startColor="#9f1239"
        endColor="#f43f5e"
        trend={Math.abs(expenses) > income ? "up" : "down"}
      />
      <BalanceCard balance={total} previousBalance={balance.current} />
    </div>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  icon: React.ReactNode;
  startColor: string;
  endColor: string;
  trend: "up" | "down" | "neutral";
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
  trend,
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
      className="text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-white/10 overflow-hidden w-full h-full flex flex-col justify-between"
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
      <CardContent className="relative z-10 mt-auto">
        <div
          className="text-xl sm:text-3xl font-bold text-gray-100 transition-colors flex items-center"
          ref={valueRef}
        >
          {formatCurrency(0)}
          <TrendIndicator trend={trend} />
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300" />
    </Card>
  );
}

function TrendIndicator({ trend }: { trend: "up" | "down" | "neutral" }) {
  const color =
    trend === "up"
      ? "text-green-400"
      : trend === "down"
      ? "text-red-400"
      : "text-gray-400";
  const icon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

  return <span className={`ml-2 ${color} text-sm`}>{icon}</span>;
}

function BalanceCard({
  balance,
  previousBalance,
}: {
  balance: number;
  previousBalance: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const percentChange =
    ((balance - previousBalance) / Math.abs(previousBalance)) * 100;
  const startColor = "#4338ca";
  const endColor = "#818cf8";

  useEffect(() => {
    if (valueRef.current) {
      const duration = 2;
      const ease = "power3.out";

      gsap.to(valueRef.current, {
        duration,
        ease,
        innerText: balance.toFixed(2),
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
  }, [balance]);

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
  }, [isHovered]);

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <Card
      ref={cardRef}
      className="text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md border border-white/10 overflow-hidden w-full h-full"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-xs sm:text-sm font-medium text-gray-200 transition-colors">
          Balanço Geral
        </CardTitle>
        <div className="p-1 sm:p-2 rounded-full bg-white/10">
          <TrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div
          className="text-xl sm:text-3xl font-bold text-gray-100 transition-colors flex items-center"
          ref={valueRef}
        >
          {formatCurrency(0)}
          <TrendIndicator
            trend={
              percentChange > 0 ? "up" : percentChange < 0 ? "down" : "neutral"
            }
          />
        </div>
        <div className="text-xs sm:text-sm mt-2 text-gray-300">
          {percentChange > 0 ? "+" : ""}
          {percentChange.toFixed(2)}% desde o último período
        </div>
        <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-400"
            style={{
              width: `${Math.min(
                Math.max((balance / previousBalance) * 100, 0),
                100
              )}%`,
            }}
          />
        </div>
      </CardContent>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-y-0.5 group-hover:translate-y-0 transition-transform duration-300" />
    </Card>
  );
}
