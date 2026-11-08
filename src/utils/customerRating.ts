import type { CustomerTrafficColor } from '../types';

export interface TrafficRatingMeta {
  label: string;
  shortLabel: string;
  badgeText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const getCustomerRatingMeta = (color: CustomerTrafficColor): TrafficRatingMeta => {
  switch (color) {
    case 'VERDE':
      return {
        label: 'Cliente Excelente',
        shortLabel: 'Excelente',
        badgeText: '🟢 Cliente Excelente',
        color: '#34d399',
        bgColor: '#064e3b',
        borderColor: '#10b981',
        description: 'Paga a tiempo y no tiene mora. Excelente cumplimiento.'
      };
    case 'AMARILLO':
      return {
        label: 'Cliente Regular',
        shortLabel: 'Regular',
        badgeText: '🟡 Cliente Regular',
        color: '#fbbf24',
        bgColor: '#451a03',
        borderColor: '#f59e0b',
        description: 'Cliente regular que paga pero suele tener retrasos o prórrogas.'
      };
    case 'ROJO':
      return {
        label: 'Cliente Malo',
        shortLabel: 'Malo',
        badgeText: '🔴 Cliente Malo',
        color: '#f87171',
        bgColor: '#450a0a',
        borderColor: '#ef4444',
        description: 'Cliente moroso o que falla constantemente en sus pagos.'
      };
  }
};

