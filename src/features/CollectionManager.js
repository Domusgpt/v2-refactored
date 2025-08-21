/**
 * Collection Manager - Auto-discovery system for JSON collections
 * Scans collections/ folder for JSON files and loads them automatically
 */
export class CollectionManager {
    constructor() {
        this.collections = new Map();
        this.baseCollectionPath = './collections/';
        this.loadingPromises = new Map();
    }
    
    /**
     * Auto-discover and load all JSON collections from collections/ folder AND localStorage
     * FIXED: Now checks both file-based and localStorage saved variations
     */
    async autoDiscoverCollections() {
        console.log('🔍 Auto-discovering collections in collections/ folder AND localStorage...');
        
        try {
            // Method 1: Load known files first
            const knownFiles = ['base-variations.json'];
            const loadPromises = [];
            
            for (const filename of knownFiles) {
                loadPromises.push(
                    this.loadCollection(filename).catch(() => null)
                );
            }
            
            // Wait for known files to load
            await Promise.all(loadPromises);
            
            // Method 2: CRITICAL FIX - Load user-saved variations from localStorage
            await this.loadUserSavedVariations();
            
            console.log(`✅ Auto-discovery complete: ${this.collections.size} collections loaded`);
            console.log('📁 Includes both file-based and localStorage user variations');
            
            return Array.from(this.collections.values());
            
        } catch (error) {
            console.error('❌ Collections auto-discovery error:', error);
            // Still try to load localStorage variations even if file loading fails
            await this.loadUserSavedVariations();
            return Array.from(this.collections.values());
        }
    }
    
    /**
     * Load a specific collection from the collections/ folder
     */
    async loadCollection(filename) {
        const fullPath = this.baseCollectionPath + filename;
        
        // Avoid duplicate loading
        if (this.loadingPromises.has(filename)) {
            return this.loadingPromises.get(filename);
        }
        
        const loadPromise = this.fetchCollectionFile(fullPath, filename);
        this.loadingPromises.set(filename, loadPromise);
        
        try {
            const collection = await loadPromise;
            this.collections.set(filename, collection);
            console.log(`📋 Loaded collection: ${collection.name} (${collection.variations.length} variations)`);
            return collection;
        } catch (error) {
            console.log(`📁 Collection ${filename} not available (this is normal for user files)`);
            this.loadingPromises.delete(filename);
            throw error;
        }
    }
    
    /**
     * Fetch and parse a collection file
     */
    async fetchCollectionFile(fullPath, filename) {
        const response = await fetch(fullPath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Validate collection format
        if (!data.type || data.type !== 'holographic-collection') {
            throw new Error('Invalid collection format: missing type');
        }
        
        if (!data.variations || !Array.isArray(data.variations)) {
            throw new Error('Invalid collection format: missing variations array');
        }
        
        // Add metadata
        data.filename = filename;
        data.loadedAt = new Date().toISOString();
        
        return data;
    }
    
    /**
     * Get all loaded collections
     */
    getAllCollections() {
        return Array.from(this.collections.values());
    }
    
    /**
     * Get a specific collection by filename
     */
    getCollection(filename) {
        return this.collections.get(filename);
    }
    
    /**
     * Get all variations from all collections (flattened)
     */
    getAllVariations() {
        const allVariations = [];
        let currentId = 0;
        
        for (const collection of this.collections.values()) {
            for (const variation of collection.variations) {
                allVariations.push({
                    ...variation,
                    id: currentId++,
                    collectionName: collection.name,
                    collectionFilename: collection.filename,
                    isFromCollection: true
                });
            }
        }
        
        return allVariations;
    }
    
    /**
     * Save a new collection or append to existing user collection
     */
    async saveCollection(collection, filename) {
        // Validate filename
        if (!filename.endsWith('.json')) {
            filename += '.json';
        }
        
        let formattedCollection;
        
        // Check if we're appending to an existing user collection
        const existingCollection = this.collections.get(filename);
        if (existingCollection && filename.includes('user-custom-')) {
            // Append to existing collection
            const newVariations = [...existingCollection.variations, ...collection.variations];
            
            // Update IDs to be sequential
            newVariations.forEach((variation, index) => {
                variation.id = index;
            });
            
            formattedCollection = {
                ...existingCollection,
                totalVariations: newVariations.length,
                variations: newVariations,
                updated: new Date().toISOString()
            };
            
            console.log(`📝 Appending to existing collection: ${existingCollection.name}`);
        } else {
            // Create new collection
            formattedCollection = {
                name: collection.name || 'Unnamed Collection',
                description: collection.description || '',
                version: '1.0',
                type: 'holographic-collection',
                profileName: collection.profileName || 'VIB34D System',
                totalVariations: collection.variations.length,
                created: new Date().toISOString(),
                variations: collection.variations
            };
        }
        
        // Convert to JSON
        const jsonData = JSON.stringify(formattedCollection, null, 2);
        
        // Create download (since we can't write directly to collections/)
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log(`💾 Collection saved: ${filename}`);
        console.log(`📁 To use: Move ${filename} to collections/ folder and refresh gallery`);
        
        // Update our internal collection if it exists
        if (existingCollection) {
            this.collections.set(filename, formattedCollection);
        }
        
        return formattedCollection;
    }
    
    /**
     * Create a collection from custom variations
     */
    createCustomCollection(customVariations, name) {
        const collection = {
            name: name || `Custom Collection ${new Date().toLocaleDateString()}`,
            description: 'User-created custom holographic variations',
            version: '1.0',
            type: 'holographic-collection',
            profileName: 'Active Holographic Systems',
            totalVariations: customVariations.length,
            created: new Date().toISOString(),
            variations: customVariations.map((cv, index) => ({
                id: index,
                name: cv.name || `Custom Variation ${index + 1}`,
                isCustom: true,
                parameters: {
                    geometryType: cv.params.geometry,
                    density: cv.params.density,
                    speed: cv.params.speed,
                    chaos: cv.params.chaos,
                    morph: cv.params.morph,
                    hue: cv.params.hue,
                    saturation: cv.params.saturation,
                    intensity: cv.params.intensity
                }
            }))
        };
        
        return collection;
    }
    
    /**
     * CRITICAL FIX: Load user-saved variations from localStorage (UnifiedSaveManager storage)
     * This bridges the gap between save system and gallery system
     */
    async loadUserSavedVariations() {
        try {
            // Check UnifiedSaveManager storage keys
            const unifiedVariationsKey = 'vib34d-unified-variations';
            const unifiedCollectionsKey = 'vib34d-unified-collections';
            
            // Load unified variations
            const storedVariations = localStorage.getItem(unifiedVariationsKey);
            if (storedVariations) {
                const variations = JSON.parse(storedVariations);
                console.log(`🔵 Found ${variations.length} user-saved variations in localStorage`);
                
                if (variations.length > 0) {
                    // Group variations by date for tabs
                    const variationsByDate = {};
                    variations.forEach(variation => {
                        const date = new Date(variation.timestamp || variation.created || Date.now());
                        const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
                        const displayDate = date.toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        
                        if (!variationsByDate[dateKey]) {
                            variationsByDate[dateKey] = {
                                displayDate,
                                variations: []
                            };
                        }
                        variationsByDate[dateKey].variations.push(variation);
                    });
                    
                    // Create a unified collection with date-based organization
                    const userCollection = {
                        name: `User Saved Variations (${variations.length})`,
                        description: `Custom variations saved by user - organized by date`,
                        version: '1.0',
                        type: 'holographic-collection',
                        profileName: 'VIB34D User',
                        totalVariations: variations.length,
                        variationsByDate: variationsByDate, // Add date organization
                        created: new Date().toISOString(),
                        filename: 'user-saved-localStorage.json',
                        loadedAt: new Date().toISOString(),
                        variations: variations.map((variation, index) => ({
                            id: index + 100, // Start user variations at ID 100+
                            name: variation.name || `User Variation ${index + 1}`,
                            isCustom: true,
                            globalId: variation.id || `USER-${Date.now()}-${index}`,
                            system: this.detectSystemFromParameters(variation.system, variation.parameters),
                            parameters: this.normalizeParameters(variation.parameters || {})
                        }))
                    };
                    
                    // Add to collections
                    this.collections.set('user-saved-localStorage.json', userCollection);
                    console.log(`✅ Added user collection: ${userCollection.name}`);
                }
            }
            
            // Load unified collections
            const storedCollections = localStorage.getItem(unifiedCollectionsKey);
            if (storedCollections) {
                try {
                    const collectionsArray = JSON.parse(storedCollections);
                    console.log(`🔵 Found ${collectionsArray.length} user collections in localStorage`);
                    
                    collectionsArray.forEach(([filename, collection]) => {
                        if (collection && collection.variations) {
                            // Ensure proper formatting
                            collection.filename = filename;
                            collection.loadedAt = new Date().toISOString();
                            
                            // Normalize variation IDs to avoid conflicts
                            collection.variations.forEach((variation, index) => {
                                if (!variation.globalId) {
                                    variation.globalId = `USER-${Date.now()}-${index}`;
                                }
                            });
                            
                            this.collections.set(filename, collection);
                            console.log(`✅ Added localStorage collection: ${collection.name}`);
                        }
                    });
                } catch (collectionsError) {
                    console.warn('⚠️ Error parsing stored collections:', collectionsError);
                }
            }
            
            console.log(`📊 Total collections after localStorage load: ${this.collections.size}`);
            
        } catch (error) {
            console.error('❌ Error loading user-saved variations from localStorage:', error);
        }
    }
    
    /**
     * Normalize parameters to match expected gallery format
     * ENHANCED: Handle legacy parameter formats and null/undefined values
     */
    normalizeParameters(params) {
        // CRITICAL FIX: Handle null/undefined/non-object params
        if (!params || typeof params !== 'object') {
            console.warn('⚠️ Invalid parameters, using defaults:', params);
            return this.getDefaultParameters();
        }
        
        // Convert between different parameter formats with safe fallbacks
        const normalized = {
            // Geometry - handle multiple legacy names
            geometry: this.safeNumber(params.geometry || params.geometryType || params.geom, 0),
            geometryType: this.safeNumber(params.geometry || params.geometryType || params.geom, 0),
            
            // Grid/Density - handle legacy names  
            gridDensity: this.safeNumber(params.gridDensity || params.density || params.grid, 10),
            density: this.safeNumber(params.gridDensity || params.density || params.grid, 10),
            
            // Animation speed
            speed: this.safeNumber(params.speed || params.animSpeed, 1.0),
            
            // Chaos/randomization
            chaos: this.safeNumber(params.chaos || params.randomness, 0),
            
            // Morphing
            morphFactor: this.safeNumber(params.morphFactor || params.morph, 0),
            morph: this.safeNumber(params.morphFactor || params.morph, 0),
            
            // Colors - handle multiple formats
            hue: this.safeNumber(params.hue || params.color || params.colorHue, 200),
            saturation: this.safeNumber(params.saturation || params.sat, 0.8),
            intensity: this.safeNumber(params.intensity || params.brightness, 0.5),
            
            // 4D rotation parameters
            rot4dXW: this.safeNumber(params.rot4dXW || params.rotXW, 0),
            rot4dYW: this.safeNumber(params.rot4dYW || params.rotYW, 0), 
            rot4dZW: this.safeNumber(params.rot4dZW || params.rotZW, 0),
            
            // Dimension
            dimension: this.safeNumber(params.dimension || params.dim, 3.8)
        };
        
        console.log('🔧 Parameter normalization:', { original: params, normalized });
        return normalized;
    }
    
    /**
     * Safely convert value to number with fallback
     */
    safeNumber(value, fallback) {
        if (value === null || value === undefined || value === '') {
            return fallback;
        }
        
        const num = parseFloat(value);
        return isNaN(num) ? fallback : num;
    }
    
    /**
     * Get default parameters for invalid variations
     */
    getDefaultParameters() {
        return {
            geometry: 0,
            geometryType: 0,
            gridDensity: 10,
            density: 10,
            speed: 1.0,
            chaos: 0,
            morphFactor: 0,
            morph: 0,
            hue: 200,
            saturation: 0.8,
            intensity: 0.5,
            rot4dXW: 0,
            rot4dYW: 0,
            rot4dZW: 0,
            dimension: 3.8
        };
    }
    
    /**
     * Detect system type from parameters when system property is missing
     */
    detectSystemFromParameters(explicitSystem, parameters) {
        // If system is explicitly set, use it
        if (explicitSystem && ['faceted', 'quantum', 'holographic', 'polychora'].includes(explicitSystem)) {
            return explicitSystem;
        }
        
        // Try to detect from parameters
        if (!parameters || typeof parameters !== 'object') {
            return 'faceted'; // Default fallback
        }
        
        // Polychora detection: Has polytope parameter
        if (parameters.polytope !== undefined || parameters.polytopeType !== undefined) {
            return 'polychora';
        }
        
        // Holographic detection: Has high-end effects or audio parameters
        if (parameters.audioReactive || parameters.microphone || 
            (parameters.intensity !== undefined && parameters.intensity > 0.7) ||
            (parameters.saturation !== undefined && parameters.saturation > 0.9)) {
            return 'holographic';
        }
        
        // Quantum detection: Has complex parameters or high values
        if ((parameters.chaos !== undefined && parameters.chaos > 0.3) ||
            (parameters.morphFactor !== undefined && parameters.morphFactor > 0.5) ||
            (parameters.dimension !== undefined && parameters.dimension > 3.5)) {
            return 'quantum';
        }
        
        // Default to faceted for simple configurations
        return 'faceted';
    }

    /**
     * Get collection statistics
     */
    getStatistics() {
        const collections = Array.from(this.collections.values());
        const stats = {
            totalCollections: collections.length,
            totalVariations: collections.reduce((sum, c) => sum + c.variations.length, 0),
            customCollections: collections.filter(c => c.name.includes('User') || c.name.includes('Custom')).length,
            baseCollections: collections.filter(c => c.name.includes('Base')).length,
            collections: collections.map(c => ({
                name: c.name,
                filename: c.filename,
                variationCount: c.variations.length,
                created: c.created
            }))
        };
        
        return stats;
    }
}