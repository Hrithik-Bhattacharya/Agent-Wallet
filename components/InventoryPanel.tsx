import React from 'react';
import type { Asset } from '../types';
import { PackageIcon, DataPacketIcon, VoucherIcon } from './icons';

interface InventoryPanelProps {
    assets: Asset[];
}

const getAssetVisuals = (assetId: string) => {
    switch (assetId) {
        case 'pdp':
            return {
                Icon: DataPacketIcon,
                iconBgColor: 'bg-purple-900/50',
                iconColor: 'text-purple-300',
            };
        case 'srv':
            return {
                Icon: VoucherIcon,
                iconBgColor: 'bg-yellow-900/50',
                iconColor: 'text-yellow-300',
            };
        default:
            return {
                Icon: PackageIcon,
                iconBgColor: 'bg-blue-900/50',
                iconColor: 'text-blue-300',
            };
    }
};

const InventoryPanel: React.FC<InventoryPanelProps> = ({ assets }) => {
    return (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-700">
            <div className="flex items-center gap-3 mb-4">
                <PackageIcon className="h-8 w-8 text-blue-400" />
                <h2 className="text-xl font-bold text-blue-400">Agent Inventory</h2>
            </div>
            
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                {assets.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">Inventory is empty.</p>
                ) : (
                    assets.map(asset => {
                        const { Icon, iconBgColor, iconColor } = getAssetVisuals(asset.assetId);
                        return (
                            <div key={asset.id} className="bg-slate-900/50 p-3 rounded-lg flex items-center gap-3">
                               <div className={`flex-shrink-0 p-2 rounded-full ${iconBgColor}`}>
                                    <Icon className={`h-5 w-5 ${iconColor}`} />
                               </div>
                               <div>
                                    <p className="font-medium text-slate-200">{asset.name}</p>
                                    <p className="text-xs text-slate-500 font-mono">ID: {asset.id.slice(0,8)}...</p>
                               </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default InventoryPanel;