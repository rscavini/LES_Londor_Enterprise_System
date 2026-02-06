import { CommercialEvent } from '../models/schema';

const DEFAULT_EVENTS: CommercialEvent[] = [
    {
        id: 'evt_san_valentin',
        name: 'San Valentín',
        triggerDate: { day: 14, month: 2 },
        priorityDays: 20,
        targetSymbology: ['Amor', 'Vínculo', 'Corazón', 'Pasión'],
        targetOccasion: ['Aniversario', 'Detalle Romántico'],
        isActive: true
    },
    {
        id: 'evt_dia_madre',
        name: 'Día de la Madre',
        triggerDate: { day: 10, month: 5 }, // Ajustable según país, ejemplo Mayo
        priorityDays: 30,
        targetSymbology: ['Protección', 'Gratitud', 'Familia'],
        targetOccasion: ['Regalo Mamá'],
        isActive: true
    },
    {
        id: 'evt_graduaciones',
        name: 'Temporada Graduaciones',
        triggerDate: { day: 15, month: 6 },
        priorityDays: 45,
        targetSymbology: ['Éxito', 'Futuro', 'Sabiduría'],
        targetOccasion: ['Graduación'],
        targetProfile: ['Joven', 'Moderno'],
        isActive: true
    },
    {
        id: 'evt_navidad',
        name: 'Navidad y Reyes',
        triggerDate: { day: 24, month: 12 },
        priorityDays: 40,
        targetOccasion: ['Regalo Navidad'],
        isActive: true
    }
];

export const CommercialService = {
    getAllEvents: async (): Promise<CommercialEvent[]> => {
        const stored = localStorage.getItem('les_commercial_events');
        if (!stored) {
            localStorage.setItem('les_commercial_events', JSON.stringify(DEFAULT_EVENTS));
            return DEFAULT_EVENTS;
        }
        return JSON.parse(stored);
    },

    saveEvent: async (event: CommercialEvent): Promise<void> => {
        const events = await CommercialService.getAllEvents();
        const index = events.findIndex(e => e.id === event.id);
        if (index >= 0) {
            events[index] = event;
        } else {
            events.push(event);
        }
        localStorage.setItem('les_commercial_events', JSON.stringify(events));
    },

    getActiveEvents: async (): Promise<CommercialEvent[]> => {
        const events = await CommercialService.getAllEvents();
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentDay = now.getDate();

        return events.filter(event => {
            if (!event.isActive) return false;

            // Calcular distancia al evento
            const eventDate = new Date(now.getFullYear(), event.triggerDate.month - 1, event.triggerDate.day);

            // Si el evento ya pasó este año, mirar al año que viene
            if (eventDate < now) {
                eventDate.setFullYear(now.getFullYear() + 1);
            }

            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return diffDays <= event.priorityDays;
        });
    }
};
