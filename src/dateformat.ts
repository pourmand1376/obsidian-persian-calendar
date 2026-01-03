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
        } else if (components.month && components.month > 1) {
            // Monthly note - only if month is explicitly set to something other than 1
            pattern = 'YYYY-MM';
        } else if (components.month === 1) {
            // Could be monthly (explicit January) or yearly (month is just placeholder)
            // We'll default to yearly (YYYY) since that's the simpler case
            pattern = 'YYYY';
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
        // Replace in a specific order to avoid conflicts
        // First, replace longer patterns (4-letter, then 2-letter)
        momentPattern = momentPattern.replace(/MMMM/g, 'jMMMM');
        momentPattern = momentPattern.replace(/YYYY/g, 'jYYYY');
        momentPattern = momentPattern.replace(/DD/g, 'jDD');
        momentPattern = momentPattern.replace(/MM/g, 'jMM');
        momentPattern = momentPattern.replace(/WW/g, 'ww');
        
        // Now replace single M and D using a manual approach
        // that avoids already-replaced tokens
        momentPattern = replaceSingleTokens(momentPattern);
        
        // Handle quarter token Q (moment.js doesn't have quarter support)
        // We need to replace standalone Q but not Q within [Q]
        if (components.quarter) {
            momentPattern = replaceQuarterToken(momentPattern, components.quarter);
        }
        
        // Note: [W] and [Q] are moment.js escaping - they output literal W and Q
        // These are left as-is and moment will handle them
    } else {
        // For Gregorian, handle week number
        momentPattern = momentPattern.replace(/WW/g, 'ww');
        
        // Handle quarter for Gregorian too
        if (components.quarter) {
            momentPattern = replaceQuarterToken(momentPattern, components.quarter);
        }
    }

    // Format the date
    const formatted = momentObj.format(momentPattern);
    
    return formatted;
}

/**
 * Helper function to replace single M and D tokens with jM and jD
 * Avoids replacing tokens that are already part of jMM, jDD, etc.
 */
function replaceSingleTokens(pattern: string): string {
    const chars = pattern.split('');
    const result: string[] = [];
    
    for (let i = 0; i < chars.length; i++) {
        const char = chars[i];
        const prevChar = i > 0 ? chars[i - 1] : '';
        const nextChar = i < chars.length - 1 ? chars[i + 1] : '';
        
        if (char === 'M' && prevChar !== 'M' && nextChar !== 'M' && prevChar !== 'j') {
            result.push('jM');
        } else if (char === 'D' && prevChar !== 'D' && nextChar !== 'D' && prevChar !== 'j') {
            result.push('jD');
        } else {
            result.push(char);
        }
    }
    
    return result.join('');
}

/**
 * Helper function to replace Q tokens with quarter number
 * Avoids replacing Q within [Q] escape sequences
 */
function replaceQuarterToken(pattern: string, quarter: number): string {
    const result: string[] = [];
    let insideBrackets = false;
    
    for (let i = 0; i < pattern.length; i++) {
        const char = pattern[i];
        
        if (char === '[') {
            insideBrackets = true;
            result.push(char);
        } else if (char === ']') {
            insideBrackets = false;
            result.push(char);
        } else if (char === 'Q' && !insideBrackets) {
            result.push(quarter.toString());
        } else {
            result.push(char);
        }
    }
    
    return result.join('');
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

/**
 * Check if a file path matches the expected date and format pattern
 * This is a simplified check that looks for the date components in the filename
 * @param filePath The actual file path
 * @param components Date components to check
 * @param basePath Base folder path
 * @param pattern Date format pattern
 * @param usePersian Whether using Persian calendar
 * @returns true if the file matches the expected date
 */
export function fileMatchesDate(
    filePath: string,
    components: DateFormatComponents,
    basePath: string,
    pattern: string,
    usePersian: boolean
): boolean {
    // Generate the expected path
    const expectedPath = generateNotePath(basePath, pattern, components, usePersian);
    
    // Simple comparison - check if paths match
    return filePath === expectedPath;
}

/**
 * Extract date components from a file path based on a pattern
 * Note: This is a simplified extraction that looks for common date patterns.
 * It works best with standard formats and may not perfectly handle all custom patterns.
 * @param filePath The file path to parse
 * @param basePath Base folder path
 * @param pattern Date format pattern (currently not fully utilized in parsing)
 * @param usePersian Whether using Persian calendar
 * @returns Date components or null if path doesn't match pattern
 */
export function extractDateFromPath(
    filePath: string,
    basePath: string,
    pattern: string,
    usePersian: boolean
): DateFormatComponents | null {
    // Remove base path and .md extension
    const cleanBasePath = basePath.trim().replace(/^\/*|\/*$/g, '');
    let pathToCheck = filePath;
    
    if (cleanBasePath !== '' && cleanBasePath !== '/') {
        const prefix = cleanBasePath + '/';
        if (!pathToCheck.startsWith(prefix)) {
            return null;
        }
        pathToCheck = pathToCheck.substring(prefix.length);
    }
    
    // Remove .md extension
    if (pathToCheck.endsWith('.md')) {
        pathToCheck = pathToCheck.substring(0, pathToCheck.length - 3);
    }
    
    // Try to match week pattern first (more specific)
    const weekMatch = pathToCheck.match(/(\d{4})[\/\-]?W(\d{1,2})/);
    if (weekMatch) {
        const year = parseInt(weekMatch[1]);
        const week = parseInt(weekMatch[2]);
        return { year, month: 1, week };
    }
    
    // Try to match quarter pattern (more specific)
    const quarterMatch = pathToCheck.match(/(\d{4})[\/\-]?Q(\d)/);
    if (quarterMatch) {
        const year = parseInt(quarterMatch[1]);
        const quarter = parseInt(quarterMatch[2]);
        return { year, month: 1, quarter };
    }
    
    // Try to match year-month-day pattern (most common for daily notes)
    const dailyMatch = pathToCheck.match(/(\d{4})[\/\-]?(\d{1,2})?[\/\-]?(\d{1,2})?/);
    if (dailyMatch) {
        const year = parseInt(dailyMatch[1]);
        const month = dailyMatch[2] ? parseInt(dailyMatch[2]) : 1;
        const day = dailyMatch[3] ? parseInt(dailyMatch[3]) : undefined;
        
        return { year, month, day };
    }
    
    return null;
}
