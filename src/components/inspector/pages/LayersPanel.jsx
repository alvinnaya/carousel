import React, { useState, useRef } from 'react';
import { useCanvasContext } from '../../../context/CanvasContext';
import LayerItem from './LayerItem';
import AddCanvasSection from './AddCanvasSection';
import TemplateSaveModal from '../../modals/TemplateSaveModal';
import Toast from '../../shared/Toast';
import templateService from '../../../api/templateService';
import { generateHighQualityPreview } from '../../../utils/canvasUtils';

/**
 * LayersPanel - Manages canvas pages with thumbnails and addition logic.
 */
const LayersPanel = () => {
    const {
        canvas,
        canvases,
        previews,
        activeCanvasIndex,
        setActiveCanvasIndex,
        addPage,
        duplicatePage,
        removePage,
        movePage,
        designInfo
    } = useCanvasContext();
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dropTargetIndex, setDropTargetIndex] = useState(null);
    const [dropPosition, setDropPosition] = useState(null);
    const [dropdownOpenIndex, setDropdownOpenIndex] = useState(null);
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateModalIndex, setTemplateModalIndex] = useState(null);
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);
    const [templateApiError, setTemplateApiError] = useState('');
    const [toastState, setToastState] = useState({ message: '', type: 'success' });
    const scrollContainerRef = useRef(null);

    const handleDrop = (targetIndex) => {
        if (draggedIndex === null) return;

        let finalTargetIndex = targetIndex;
        if (draggedIndex < targetIndex) {
            finalTargetIndex = dropPosition === 'top' ? targetIndex - 1 : targetIndex;
        } else {
            finalTargetIndex = dropPosition === 'top' ? targetIndex : targetIndex + 1;
        }

        finalTargetIndex = Math.max(0, Math.min(canvases.length - 1, finalTargetIndex));

        if (draggedIndex === finalTargetIndex) {
            setDraggedIndex(null);
            setDropTargetIndex(null);
            setDropPosition(null);
            return;
        }

        movePage(draggedIndex, finalTargetIndex);

        setDraggedIndex(null);
        setDropTargetIndex(null);
        setDropPosition(null);
    };

    // Calculate aspect ratio from the active canvas or fallback to 1/1
    const aspectRatio = canvas ? canvas.width / canvas.height : 1;

    const handleContainerDragOver = (e) => {
        e.preventDefault();
        if (!scrollContainerRef.current || draggedIndex === null) return;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();
        const y = e.clientY - rect.top;

        // Auto-scroll zones (e.g., top 10% and bottom 10% of the container)
        const scrollZoneHeight = rect.height * 0.1;
        const scrollSpeed = 10; // Pixels per frame

        if (y < scrollZoneHeight) {
            // Scroll Up
            container.scrollTop -= scrollSpeed;
        } else if (y > rect.height - scrollZoneHeight) {
            // Scroll Down
            container.scrollTop += scrollSpeed;
        }
    };

    const handleOpenTemplateModal = (index) => {
        setTemplateModalIndex(index);
        setTemplateApiError('');
        setIsTemplateModalOpen(true);
        setDropdownOpenIndex(null);
    };

    const handleSaveTemplate = async (templateName) => {
        if (templateModalIndex === null) return;

        setIsSavingTemplate(true);
        setTemplateApiError('');
        try {
            const savedState = canvases[templateModalIndex];
            const highResFile = await generateHighQualityPreview(savedState);

            const formData = new FormData();
            formData.append('Name', templateName);
            formData.append('CanvasJson', JSON.stringify(savedState));
            if (highResFile) {
                formData.append('file', highResFile);
            }

            const response = await templateService.createTemplate(formData);

            // Check success from API
            if (response && response.success !== false) { // Account for both {success: true} and plain objects
                setIsTemplateModalOpen(false);
                setTemplateModalIndex(null);
                setToastState({ message: 'Template saved successfully!', type: 'success' });
            } else {
                const errorMsg = response?.message || 'Failed to save template.';
                console.error(errorMsg);
                setTemplateApiError(errorMsg);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            const errorMsg = error.response?.data?.message || error.message || 'An unexpected error occurred.';
            setTemplateApiError(errorMsg);
        } finally {
            setIsSavingTemplate(false);
        }
    };

    return (
        <div
            className="flex-1 flex flex-col h-full relative overflow-hidden mus-bg-main"
            onDragOver={handleContainerDragOver}
        >
            {/* Pages List */}
            <div
                ref={scrollContainerRef}
                className="flex-1 space-y-3 p-4 pb-4 overflow-y-scroll overflow-x-hidden custom-scrollbar"
            >
                {canvases.map((canvasJSON, index) => (
                    <LayerItem
                        key={index}
                        index={index}
                        canvasJSON={canvasJSON}
                        previewUrl={previews[index]}
                        aspectRatio={aspectRatio}
                        isActive={activeCanvasIndex === index}
                        isDragged={draggedIndex === index}
                        isDropTarget={dropTargetIndex === index}
                        dropPosition={dropPosition}
                        draggedIndex={draggedIndex}
                        isDropdownOpen={dropdownOpenIndex === index}
                        onSetActive={() => setActiveCanvasIndex(index)}
                        setDraggedIndex={setDraggedIndex}
                        setDropTargetIndex={setDropTargetIndex}
                        setDropPosition={setDropPosition}
                        handleDrop={() => handleDrop(index)}
                        toggleDropdown={() => setDropdownOpenIndex(dropdownOpenIndex === index ? null : index)}
                        closeDropdown={() => setDropdownOpenIndex(null)}
                        onDuplicate={() => duplicatePage(index)}
                        onInsert={() => addPage(null, index + 1)}
                        onDelete={() => removePage(index)}
                        canDelete={canvases.length > 1}
                        onSaveAsTemplate={() => handleOpenTemplateModal(index)}
                    />
                ))}
            </div>

            {/* Add Page Button Section */}
            <div className="p-3 pt-3 mus-border-t-soft z-10 w-full mt-auto mus-bg-main">
                <AddCanvasSection
                    onAddDefault={() => addPage()}
                    onDuplicateActive={() => duplicatePage(activeCanvasIndex)}
                    onAddNewNextToActive={() => addPage(null, activeCanvasIndex + 1)}
                    onCreateCustom={(width, height) => addPage({ width, height })}
                />
            </div>

            <TemplateSaveModal
                isOpen={isTemplateModalOpen}
                onClose={() => {
                    if (!isSavingTemplate) {
                        setIsTemplateModalOpen(false);
                        setTemplateModalIndex(null);
                        setTemplateApiError('');
                    }
                }}
                onSave={handleSaveTemplate}
                isLoading={isSavingTemplate}
                previewUrl={templateModalIndex !== null ? previews[templateModalIndex] : null}
                apiError={templateApiError}
            />

            <Toast
                message={toastState.message}
                type={toastState.type}
                onClose={() => setToastState({ ...toastState, message: '' })}
            />
        </div>
    );
};

export default LayersPanel;
