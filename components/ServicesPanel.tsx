
import React from 'react';
import type { Service } from '../types';
import { ContractIcon, CostIcon } from './icons';

interface ServicesPanelProps {
    services: Service[];
}

const ServicesPanel: React.FC<ServicesPanelProps> = ({ services }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Available Services</h2>
            <div className="space-y-4">
                {services.map((service) => (
                    <div key={service.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-md text-slate-100 flex items-center gap-2"><ContractIcon /> {service.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400 font-semibold text-sm bg-yellow-900/50 px-2 py-1 rounded-full">
                                <CostIcon />
                                <span>{service.cost}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ServicesPanel;
