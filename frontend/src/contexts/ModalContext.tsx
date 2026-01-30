import {createContext, useContext, useState, ReactNode } from 'react';

/** setup context for the modal */
interface ModalData{
    nodeId: string;
    inputText: string;
    outputText: string;
}

interface ModalContextType {
    isOpen: boolean;
    modalData: ModalData | null;
    openModal: (data: ModalData) => void;
    closeModal: () => void;
}

interface ModalProviderProps {
    children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined> (undefined);

export function ModalProvider({ children }: ModalProviderProps){
    const [isOpen, setIsOpen] = useState(false);
    const [modalData, setModalData] = useState<ModalData | null>(null);

    const openModal = (data: ModalData) => {
        setModalData(data);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setModalData(null);
    };

    return (
        <ModalContext.Provider value = {{ isOpen, modalData, openModal, closeModal}}>

            {children}
        </ModalContext.Provider>
    );
};

export function useModal() {
    const context = useContext(ModalContext);
    if(context === undefined){
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
}