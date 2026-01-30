import {createContext, useContext, useState, ReactNode } from 'react';

/** setup context for the modal */
interface ModalData{
    nodeId: string;
    inputText: string;
    outputText: string;
}

/** defines the fields of ModalContext */
interface ModalContextType {
    isOpen: boolean;
    modalData: ModalData | null;
    openModal: (data: ModalData) => void;
    closeModal: () => void;
}

/** for children components */
interface ModalProviderProps {
    children: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined> (undefined);

/** defines important fields for ModalContext and  */
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

    /** sets up Provider for the ModalContext and imbues it with relevant fields */
    return (
        <ModalContext.Provider value = {{ isOpen, modalData, openModal, closeModal}}>

            {children}
        </ModalContext.Provider>
    );
};

/** retrieves ModalContext */
export function useModal() {
    const context = useContext(ModalContext);
    if(context === undefined){
        throw new Error('useModal must be used within ModalProvider');
    }
    return context;
}