import moment from 'moment-jalaali';

/**
 * Utility to parse date format patterns and generate file paths with folder structure
 * Supports formats like:
 * - YYYY-MM-DD (simple filename)
 * - YYYY/MM/YYYY-MM-DD (creates year/month folders)
 * - YYYY/MM-MMMM/YYYY-MM-DD (creates year/month-monthname folders)
 */

export interface DateFormatComponents {
    year: number;
    month: number;
    day?: number;
    week?: number;
    quarter?: number;
}

/**
 * Format a date according to a pattern using moment-jalaali for Persian dates
 * @param pattern The format pattern (e.g., "YYYY/MM/YYYY-MM-DD")
 * @param components Date components
 * @param usePersian Whether to use Persian (Jalaali) calendar
 * @returns Formatted path with folder structure
 */
export function formatDatePath(
    pattern: string,
    components: DateFormatComponents,
    usePersian: boolean = true
): string {
    if (!pattern || pattern.trim() === '') {
        // Default patterns if empty
        if (components.day) {
            pattern = 'YYYY-MM-DD';
        } else if (components.week) {
            pattern = 'YYYY-[W]WW';
        } else if (components.quarter) {
            pattern = 'YYYY-[Q]Q';
        } else if (components.month) {
            pattern = 'YYYY-MM';
        } else {
            pattern = 'YYYY';
        }
    }

    // Create moment object based on calendar type
    let momentObj: moment.Moment;
    
    if (usePersian) {
        moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });
        
        if (components.day) {
            momentObj = moment(`${components.year}/${components.month}/${components.day}`, 'jYYYY/jM/jD');
        } else if (components.week) {
            // For week-based formatting
            momentObj = moment().jYear(components.year).jWeek(components.week);
        } else if (components.month) {
            momentObj = moment(`${components.year}/${components.month}/1`, 'jYYYY/jM/jD');
        } else {
            momentObj = moment(`${components.year}/1/1`, 'jYYYY/jM/jD');
        }
    } else {
        // Gregorian calendar
        if (components.day) {
            momentObj = moment(`${components.year}/${components.month}/${components.day}`, 'YYYY/M/D');
        } else if (components.week) {
            momentObj = moment().year(components.year).week(components.week);
        } else if (components.month) {
            momentObj = moment(`${components.year}/${components.month}/1`, 'YYYY/M/D');
        } else {
            momentObj = moment(`${components.year}/1/1`, 'YYYY/M/D');
        }
    }

    // Convert pattern to moment-jalaali format
    let momentPattern = pattern;
    
    // Handle Persian calendar specific tokens
    if (usePersian) {
        // Replace YYYY with jYYYY for Persian year
        momentPattern = momentPattern.replace(/YYYY/g, 'jYYYY');
        // Replace MM with jMM for Persian month
        momentPattern = momentPattern.replace(/MM/g, 'jMM');
        // Replace M with jM for Persian month without padding
        momentPattern = momentPattern.replace(/(?<!j)M(?!M)/g, 'jM');
        // Replace DD with jDD for Persian day
        momentPattern = momentPattern.replace(/DD/g, 'jDD');
        // Replace D with jD for Persian day without padding
        momentPattern = momentPattern.replace(/(?<!j)D(?!D)/g, 'jD');
        // Replace MMMM with jMMMM for Persian month name
        momentPattern = momentPattern.replace(/MMMM/g, 'jMMMM');
        // Replace WW with jWW for Persian week
        momentPattern = momentPattern.replace(/WW/g, 'ww');
        // Quarter handling for Persian calendar
        if (components.quarter) {
            momentPattern = momentPattern.replace(/Q/g, components.quarter.toString());
        }
    } else {
        // For Gregorian, handle week number
        momentPattern = momentPattern.replace(/WW/g, 'ww');
        // Handle quarter
        if (components.quarter) {
            momentPattern = momentPattern.replace(/Q/g, components.quarter.toString());
        }
    }

    // Format the date
    const formatted = momentObj.format(momentPattern);
    
    return formatted;
}

/**
 * Generate a complete file path for a note
 * @param basePath Base folder path
 * @param datePattern Date format pattern
 * @param components Date components
 * @param usePersian Whether to use Persian calendar
 * @returns Complete file path with .md extension
 */
export function generateNotePath(
    basePath: string,
    datePattern: string,
    components: DateFormatComponents,
    usePersian: boolean = true
): string {
    // Clean up base path
    const cleanBasePath = basePath.trim().replace(/^\/*|\/*$/g, '');
    
    // Format the date path
    const datePath = formatDatePath(datePattern, components, usePersian);
    
    // Combine base path and date path
    let fullPath: string;
    if (cleanBasePath === '' || cleanBasePath === '/') {
        fullPath = datePath;
    } else {
        fullPath = `${cleanBasePath}/${datePath}`;
    }
    
    // Add .md extension if not present
    if (!fullPath.endsWith('.md')) {
        fullPath += '.md';
    }
    
    return fullPath;
}

/**
 * Extract the folder path from a complete file path
 * @param filePath Complete file path
 * @returns Folder path without filename
 */
export function extractFolderPath(filePath: string): string {
    const lastSlashIndex = filePath.lastIndexOf('/');
    if (lastSlashIndex === -1) {
        return '';
    }
    return filePath.substring(0, lastSlashIndex);
}
