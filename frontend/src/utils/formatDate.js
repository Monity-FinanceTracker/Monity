const formatDate = (dateString) => {
    if (!dateString) return '';
    
    // Handle Date objects
    if (dateString instanceof Date) {
        const day = String(dateString.getDate()).padStart(2, '0');
        const month = String(dateString.getMonth() + 1).padStart(2, '0');
        const year = String(dateString.getFullYear());
        return `${day}/${month}/${year}`;
    }
    
    // Handle string dates (YYYY-MM-DD format from database)
    // Parse as local date to avoid timezone issues
    if (typeof dateString === 'string') {
        // Check if it's in YYYY-MM-DD format
        const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (dateMatch) {
            const [, year, month, day] = dateMatch;
            // Return in DD/MM/YYYY format
            return `${day}/${month}/${year}`;
        }
        
        // If it's already in a different format, try to parse it
        // Remove time portion if present (YYYY-MM-DDTHH:mm:ss)
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            return `${day}/${month}/${year}`;
        }
    }
    
    return '';
};

export default formatDate; 