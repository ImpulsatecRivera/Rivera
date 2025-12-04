import React, { useState } from 'react';
import { DollarSign, Tag, Clock, HandCoins, RotateCcw } from 'lucide-react';

const SalesDashboard = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const smallCards = [
    { icon: DollarSign },
    { icon: Tag },
    { icon: Clock },
    { icon: HandCoins }
  ];

  const handleCardClick = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-gray-600">
          RELATÓRIO DE <span className="font-semibold text-gray-800">VENDAS</span>
        </h1>
        <div className="w-full h-px bg-gray-200 mt-4"></div>
      </div>

      {/* Cards Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Small Cards Column - Stacked */}
        <div className="col-span-2">
          <div className="relative" style={{ height: '520px' }}>
            {smallCards.map((card, index) => {
              const Icon = card.icon;
              const isExpanded = expandedIndex === index;
              const isHidden = expandedIndex !== null && !isExpanded;
              
              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(index)}
                  className={`
                    absolute w-full transition-all duration-500 ease-out cursor-pointer
                    ${isHidden ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
                    ${isExpanded ? 'z-50' : ''}
                  `}
                  style={{
                    top: isExpanded ? '0px' : `${index * 35}px`,
                    zIndex: isExpanded ? 50 : (10 - index)
                  }}
                >
                  <div className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="p-3 bg-indigo-50 rounded-xl w-fit">
                      <Icon size={20} className="text-indigo-400" strokeWidth={1.5} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Large Cards Section */}
        <div className="col-span-10 grid grid-cols-10 gap-6">
          {/* Purple Card with gradient header */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden h-[240px] border border-gray-100">
              {/* Purple gradient header */}
              <div className="h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 relative">
                <div className="absolute bottom-3 left-5">
                  <div className="p-2 bg-white rounded-lg">
                    <RotateCcw size={18} className="text-indigo-500" strokeWidth={1.5} />
                  </div>
                </div>
              </div>
              <div className="p-5">
                {/* Content */}
              </div>
            </div>
          </div>

          {/* Two white cards */}
          <div className="col-span-4 grid grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-5 shadow-md h-[240px] border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit">
                <Tag size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-md h-[240px] border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit">
                <Clock size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Right white card */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl p-5 shadow-md h-[240px] border border-gray-100">
              <div className="p-3 bg-indigo-50 rounded-xl w-fit">
                <HandCoins size={20} className="text-indigo-400" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Purple gradient card - Left bottom */}
        <div className="col-span-2">
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-indigo-700 rounded-2xl p-6 shadow-lg h-[260px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 rounded-full opacity-20 -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-indigo-800 rounded-full opacity-30 -ml-10 -mb-10"></div>
          </div>
        </div>

        {/* Two white cards - Center bottom */}
        <div className="col-span-7 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-md h-[260px] border border-gray-100">
            {/* Content */}
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md h-[260px] border border-gray-100">
            {/* Content */}
          </div>
        </div>

        {/* Large white card - Right bottom */}
        <div className="col-span-3">
          <div className="bg-white rounded-2xl p-6 shadow-md h-[260px] border border-gray-100">
            {/* Content */}
          </div>
        </div>
      </div>

      {/* Bottom full-width card */}
      <div className="mt-6 bg-white rounded-2xl p-8 shadow-md min-h-[160px] border border-gray-100">
        {/* Content */}
      </div>
    </div>
  );
};

export default SalesDashboard;