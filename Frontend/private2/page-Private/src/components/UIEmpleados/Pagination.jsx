import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  handlePageChange, 
  getPageNumbers, 
  itemsPerPage, 
  totalItems 
}) => {
  return (
    <div className="p-8 pt-4 border-t border-gray-100" style={{backgroundColor: '#f8fafc'}}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Mostrando datos {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} entradas
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex space-x-1">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={index} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>
              ) : (
                <button 
                  key={index}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'text-white shadow-sm'
                      : 'text-gray-700 border border-gray-200 hover:bg-white'
                  }`}
                  style={currentPage === page ? {backgroundColor: '#5F8EAD'} : {}}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-3 hover:bg-white rounded-xl transition-colors shadow-sm border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;