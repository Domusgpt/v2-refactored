/**
 * UnifiedSaveManager - Single save system for all VIB34D variations
 * Replaces multiple conflicting save systems with one unified approach
 */

export class UnifiedSaveManager {
    constructor(engine) {
        this.engine = engine;
        this.storageKey = 'vib34d-unified-variations';
        this.collectionStorageKey = 'vib34d-unified-collections';
        this.maxVariations = 10000; // Support up to 10k variations
        
        // Initialize storage
        this.variations = [];
        this.collections = new Map();
        
        this.loadFromStorage();
    }
    
    /**
     * Main save method with multiple output options
     */
    async save(options = {}) {
        const variation = this.captureCurrentState();
        
        // Add metadata
        variation.id = this.generateUniqueId();
        variation.timestamp = Date.now();
        variation.created = new Date().toISOString();
        
        // Save based on target
        switch (options.target || 'gallery') {
            case 'localStorage':
                return this.saveToLocalStorage(variation);
                
            case 'download':
                return this.saveToDownload(variation, options.format || 'json');
                
            case 'gallery':
                return this.saveToGallery(variation);
                
            case 'collection':
                return this.saveToCollection(variation, options.collectionName);
                
            case 'share':
                return this.saveForSharing(variation);
                
            default:
                return this.saveToGallery(variation);
        }
    }
    
    /**
     * Capture current engine state as variation
     */
    captureCurrentState() {
        // Use window.currentSystem as primary source since it's managed by main interface
        const currentSys = window.currentSystem || 'faceted';
        
        console.log('🔵 UnifiedSaveManager capturing state for system:', currentSys);
        
        const state = {
            system: currentSys,
            name: this.generateVariationName(),
            parameters: {},
            metadata: {}
        };
        
        // Get parameters based on current system
        if (currentSys === 'faceted') {
            // Get parameters from VIB34D engine
            if (this.engine?.parameterManager) {
                state.parameters = this.engine.parameterManager.getAllParameters() || {};
                console.log('🔵 Captured faceted parameters:', state.parameters);
            } else {
                console.warn('⚠️ VIB34D engine or parameterManager not available');
                // Fallback to manual parameter capture
                state.parameters = this.captureManualParameters();
            }
        } else if (currentSys === 'quantum') {
            // Get parameters from quantum system
            if (window.quantumEngine?.getParameters) {
                state.parameters = window.quantumEngine.getParameters();
                console.log('🔵 Captured quantum parameters:', state.parameters);
            } else {
                console.warn('⚠️ Quantum system not available');
                state.parameters = this.captureManualParameters();
            }
        } else if (currentSys === 'holographic') {
            // Get parameters from holographic system
            if (window.holographicSystem?.getParameters) {
                state.parameters = window.holographicSystem.getParameters();
                console.log('🔵 Captured holographic parameters:', state.parameters);
            } else {
                console.warn('⚠️ Holographic system not available');
                state.parameters = this.captureManualParameters();
            }
        } else if (currentSys === 'polychora') {
            // Get parameters from polychora system
            if (window.polychoraSystem?.parameters) {
                state.parameters = { ...window.polychoraSystem.parameters };
                console.log('🔵 Captured polychora parameters:', state.parameters);
            } else if (window.polychoraSystem?.getParameters) {
                state.parameters = window.polychoraSystem.getParameters();
                console.log('🔵 Captured polychora parameters via getParameters:', state.parameters);
            } else {
                console.warn('⚠️ Polychora system not available');
                state.parameters = this.captureManualParameters();
            }
        } else {
            // Unknown system - try manual capture
            console.warn('⚠️ Unknown system:', currentSys, '- using manual parameter capture');
            state.parameters = this.captureManualParameters();
        }
        
        // Add metadata
        state.metadata = {
            engine: 'VIB34D Unified',
            version: '3.0',
            author: 'VIB34D User',
            device: navigator.userAgent
        };
        
        console.log('🔵 Final captured state:', state);
        return state;
    }
    
    /**
     * Fallback method to capture parameters manually from UI elements
     */
    captureManualParameters() {
        const params = {};
        
        // Get geometry selection
        const activeGeomBtn = document.querySelector('.geom-btn.active');
        if (activeGeomBtn) {
            params.geometry = parseInt(activeGeomBtn.dataset.index);
            params.geometryType = params.geometry;
        }
        
        // Get all slider parameters
        const sliderIds = [
            'rot4dXW', 'rot4dYW', 'rot4dZW', 'rot4dXY', 'rot4dXZ', 'rot4dYZ',
            'gridDensity', 'morphFactor', 'chaos', 'speed', 'hue', 'intensity', 'saturation',
            'dimension'
        ];
        
        sliderIds.forEach(id => {
            const slider = document.getElementById(id);
            if (slider) {
                params[id] = parseFloat(slider.value);
            }
        });
        
        console.log('🔵 Manual parameter capture:', params);
        return params;
    }
    
    /**
     * Save to localStorage for persistence
     */
    saveToLocalStorage(variation) {
        // Add to variations array
        this.variations.push(variation);
        
        // Limit to max variations
        if (this.variations.length > this.maxVariations) {
            this.variations = this.variations.slice(-this.maxVariations);
        }
        
        // Save to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.variations));
            console.log('✅ Saved variation to localStorage:', variation.name);
            return { success: true, id: variation.id };
        } catch (error) {
            console.error('❌ Failed to save to localStorage:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Save to gallery (localStorage + visual notification)
     */
    async saveToGallery(variation) {
        // Save to localStorage first
        const localResult = this.saveToLocalStorage(variation);
        
        if (!localResult.success) {
            return localResult;
        }
        
        // CRITICAL FIX: Group custom saves by date instead of individual collections
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const collectionKey = `custom-saves-${today}`;
        const todayFormatted = new Date().toLocaleDateString();
        
        // Get or create today's collection
        let todaysCollection = this.collections.get(collectionKey);
        
        if (!todaysCollection) {
            // Create new daily collection
            console.log(`📅 Creating new daily collection: ${collectionKey}`);
            todaysCollection = {
                name: `Custom Saves - ${todayFormatted}`,
                description: `Custom variations saved on ${todayFormatted}`,
                version: '1.0',
                type: 'holographic-collection',
                profileName: 'VIB34D User',
                totalVariations: 0,
                created: variation.created,
                updated: variation.created,
                filename: collectionKey,
                variations: []
            };
            this.collections.set(collectionKey, todaysCollection);
        }
        
        // Add variation to today's collection (not individual collection)
        const variationInCollection = {
            id: todaysCollection.variations.length,
            name: variation.name,
            isCustom: true,
            globalId: variation.id,
            system: variation.system,
            parameters: this.normalizeParameters(variation.parameters)
        };
        
        todaysCollection.variations.push(variationInCollection);
        todaysCollection.totalVariations = todaysCollection.variations.length;
        todaysCollection.updated = new Date().toISOString();
        
        console.log(`📝 Added variation to daily collection. Total in ${collectionKey}: ${todaysCollection.totalVariations}`);
        
        // Update localStorage collections
        this.saveCollectionsToStorage();
        
        // Show success notification with date grouping info
        if (this.engine.statusManager) {
            this.engine.statusManager.success(
                `✅ Saved to Gallery!<br>` +
                `<strong>${variation.name}</strong><br>` +
                `Added to: ${todaysCollection.name}<br>` +
                `Total today: ${todaysCollection.totalVariations}<br>` +
                `<small>Gallery will update automatically</small>`
            );
        }
        
        // Emit event for real-time gallery update
        this.emitGalleryUpdate(variation);
        
        return { success: true, id: variation.id, collection: collectionKey, totalInCollection: todaysCollection.totalVariations };
    }
    
    /**
     * Save as downloadable file
     */
    saveToDownload(variation, format = 'json') {
        let content, filename, mimeType;
        
        switch (format) {
            case 'json':
                content = JSON.stringify(variation, null, 2);
                filename = `vib34d-${variation.id}.json`;
                mimeType = 'application/json';
                break;
                
            case 'collection':
                const collection = this.createCollectionFormat([variation]);
                content = JSON.stringify(collection, null, 2);
                filename = `collection-${variation.id}.json`;
                mimeType = 'application/json';
                break;
                
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        
        // Create download
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`📥 Downloaded ${filename}`);
        return { success: true, filename };
    }
    
    /**
     * Save to named collection
     */
    saveToCollection(variation, collectionName = 'My Collection') {
        // Get or create collection
        let collection = this.collections.get(collectionName);
        
        if (!collection) {
            collection = this.createCollectionFormat([], collectionName);
            this.collections.set(collectionName, collection);
        }
        
        // Add variation to collection
        collection.variations.push({
            id: collection.variations.length,
            name: variation.name,
            isCustom: true,
            globalId: variation.id,
            system: variation.system,
            parameters: this.normalizeParameters(variation.parameters)
        });
        
        collection.totalVariations = collection.variations.length;
        collection.updated = new Date().toISOString();
        
        // Save collections
        this.saveCollectionsToStorage();
        
        console.log(`📁 Added to collection "${collectionName}":`, variation.name);
        return { success: true, collection: collectionName, id: variation.id };
    }
    
    /**
     * Save for sharing (generates shareable URL)
     */
    saveForSharing(variation) {
        // Save to localStorage first
        this.saveToLocalStorage(variation);
        
        // Generate shareable URL
        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
        const params = new URLSearchParams();
        params.set('id', variation.id);
        params.set('system', variation.system);
        
        // Encode parameters
        Object.entries(variation.parameters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.set(key, value);
            }
        });
        
        const shareUrl = `${baseUrl}share.html?${params.toString()}`;
        
        // Copy to clipboard
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
            
            if (this.engine.statusManager) {
                this.engine.statusManager.success(
                    `🔗 Share URL copied!<br>` +
                    `<small>${shareUrl}</small>`
                );
            }
        }
        
        return { success: true, url: shareUrl, id: variation.id };
    }
    
    /**
     * Normalize parameters across different systems
     */
    normalizeParameters(params) {
        const normalized = {};
        
        // Map common parameters
        normalized.geometryType = params.geometry || params.geometryType || 0;
        normalized.density = params.gridDensity || params.density || 10;
        normalized.morph = params.morphFactor || params.morph || 0;
        normalized.speed = params.speed || 1.0;
        normalized.chaos = params.chaos || 0;
        normalized.hue = params.hue || 200;
        normalized.saturation = params.saturation || 0.8;
        normalized.intensity = params.intensity || 0.5;
        
        // 4D rotation parameters
        normalized.rot4dXW = params.rot4dXW || 0;
        normalized.rot4dYW = params.rot4dYW || 0;
        normalized.rot4dZW = params.rot4dZW || 0;
        normalized.dimension = params.dimension || 3.8;
        
        // Future 4D rotations (for Polychora enhancement)
        normalized.rot4dXY = params.rot4dXY || 0;
        normalized.rot4dXZ = params.rot4dXZ || 0;
        normalized.rot4dYZ = params.rot4dYZ || 0;
        
        return normalized;
    }
    
    /**
     * Create collection format
     */
    createCollectionFormat(variations = [], name = 'Unnamed Collection') {
        return {
            name,
            description: 'VIB34D Unified Collection',
            version: '1.0',
            type: 'holographic-collection',
            profileName: 'VIB34D System',
            totalVariations: variations.length,
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            variations: variations.map((v, i) => ({
                id: i,
                name: v.name,
                isCustom: true,
                globalId: v.id || this.generateUniqueId(),
                system: v.system,
                parameters: this.normalizeParameters(v.parameters || {})
            }))
        };
    }
    
    /**
     * Load from localStorage
     */
    loadFromStorage() {
        try {
            // Load variations
            const storedVariations = localStorage.getItem(this.storageKey);
            if (storedVariations) {
                this.variations = JSON.parse(storedVariations);
                console.log(`📂 Loaded ${this.variations.length} variations from storage`);
            }
            
            // Load collections
            const storedCollections = localStorage.getItem(this.collectionStorageKey);
            if (storedCollections) {
                const collectionsArray = JSON.parse(storedCollections);
                this.collections = new Map(collectionsArray);
                console.log(`📁 Loaded ${this.collections.size} collections from storage`);
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
        }
    }
    
    /**
     * Save collections to localStorage
     */
    saveCollectionsToStorage() {
        try {
            const collectionsArray = Array.from(this.collections.entries());
            localStorage.setItem(this.collectionStorageKey, JSON.stringify(collectionsArray));
        } catch (error) {
            console.error('Failed to save collections:', error);
        }
    }
    
    /**
     * Emit gallery update event
     */
    emitGalleryUpdate(variation) {
        const event = new CustomEvent('vib34d-gallery-update', {
            detail: { variation, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Generate unique ID
     */
    generateUniqueId() {
        return `V${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Generate variation name
     */
    generateVariationName() {
        const systems = {
            faceted: 'FACETED',
            holographic: 'HOLO', 
            polychora: 'POLY'
        };
        
        const currentSys = window.currentSystem || 'faceted';
        const system = systems[currentSys] || 'CUSTOM';
        const timestamp = new Date().toTimeString().split(' ')[0].replace(/:/g, '');
        
        return `${system}-${timestamp}`;
    }
    
    /**
     * Get all variations
     */
    getAllVariations() {
        return this.variations;
    }
    
    /**
     * Get all collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        this.variations = [];
        this.collections.clear();
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.collectionStorageKey);
        console.log('🗑️ Cleared all saved data');
    }
}