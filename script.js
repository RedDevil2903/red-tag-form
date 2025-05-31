// Global variables for form data storage and analytics
let formDatabase = [];
let attachedFiles = [];

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadStoredData();
    updateAnalytics();
    setDefaultDate();
    initializeEventListeners();
});

/**
 * Set today's date as default for removal date field
 */
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('removalDate').value = today;
}

/**
 * Initialize event listeners for file inputs and form auto-save
 */
function initializeEventListeners() {
    // File input event listeners
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('cameraInput').addEventListener('change', handleFileSelect);
    
    // Auto-save draft functionality
    let saveTimeout;
    document.getElementById('redTagForm').addEventListener('input', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            console.log('Auto-saving draft...');
            // Auto-save draft logic would go here in real implementation
        }, 2000);
    });
}

/**
 * Load stored data from database (simulated with mock data)
 */
function loadStoredData() {
    // Simulate loading from company database
    const mockData = [
        {
            id: 1, 
            mfc: 'HLN01', 
            partNumber: 'MOT-001', 
            removedFrom: 'LR0000', 
            reasonRemove: 'Defected', 
            date: '2024-01-15'
        },
        {
            id: 2, 
            mfc: 'EMK01', 
            partNumber: 'PCB-445', 
            removedFrom: 'RB-2024-002', 
            reasonRemove: 'Scrap', 
            date: '2024-01-20'
        },
        {
            id: 3, 
            mfc: 'BS01', 
            partNumber: 'MOT-001', 
            removedFrom: 'RB-2024-003', 
            reasonRemove: 'Defected', 
            date: '2024-02-01'
        },
        {
            id: 4, 
            mfc: 'DAL01', 
            partNumber: 'SEN-220', 
            removedFrom: 'RB-2024-001', 
            reasonRemove: 'Required For R&D', 
            date: '2024-02-10'
        },
        {
            id: 5, 
            mfc: 'NYC01', 
            partNumber: 'PCB-445', 
            removedFrom: 'RB-2024-004', 
            reasonRemove: 'Defected', 
            date: '2024-02-15'
        }
    ];
    formDatabase = mockData;
}

/**
 * Trigger camera input for file capture
 */
function useCamera() {
    document.getElementById('cameraInput').click();
}

/**
 * Trigger file chooser for file selection
 */
function chooseFile() {
    document.getElementById('fileInput').click();
}

/**
 * Handle file selection from both camera and file chooser
 * @param {Event} event - File input change event
 */
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    attachedFiles = attachedFiles.concat(files);
    updateFileList();
}

/**
 * Update the display of attached files list
 */
function updateFileList() {
    const fileList = document.getElementById('fileList');
    
    if (attachedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }

    fileList.innerHTML = '<strong>Attached Files:</strong><br>' + 
        attachedFiles.map((file, index) => 
            `<span style="display: inline-block; margin: 5px; padding: 5px 10px; background: #e3f2fd; border-radius: 15px; font-size: 14px; border: 1px solid #1976d2;">
                ${file.name} 
                <button onclick="removeFile(${index})" style="border: none; background: none; color: #d32f2f; cursor: pointer; font-weight: bold;">×</button>
            </span>`
        ).join('');
}

/**
 * Remove a file from the attached files list
 * @param {number} index - Index of file to remove
 */
function removeFile(index) {
    attachedFiles.splice(index, 1);
    updateFileList();
}

/**
 * Save the form data to database and send notifications
 */
function saveForm() {
    const form = document.getElementById('redTagForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    // Validate required fields
    const requiredFields = ['mfc', 'removalDate', 'taggedBy', 'itemType', 'partNumber', 'removedFrom', 'reasonRemove'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
        showMessage('Please fill in all required fields: ' + missingFields.join(', '), 'error');
        return;
    }

    // Add metadata
    data.id = Date.now();
    data.timestamp = new Date().toISOString();
    data.attachedFiles = attachedFiles.map(f => f.name);

    // Add to database
    formDatabase.push(data);
    
    // Save to server and send notifications
    simulateServerSave(data);
    sendToSlack(data);
    
    // Update analytics and clear form
    updateAnalytics();
    clearForm();
    
    showMessage('Form saved successfully! Backup sent to Slack channel.', 'success');
}

/**
 * Clear the form and reset to default state
 */
function clearForm() {
    const form = document.getElementById('redTagForm');
    form.reset();
    attachedFiles = [];
    updateFileList();
    setDefaultDate();
}

/**
 * Simulate saving data to company server
 * @param {Object} data - Form data to save
 */
function simulateServerSave(data) {
    console.log('Saving to company database:', data);
    
    // In real implementation, this would be:
    // fetch('/api/red-tag', { 
    //     method: 'POST', 
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data) 
    // })
    // .then(response => response.json())
    // .then(result => console.log('Saved successfully:', result))
    // .catch(error => console.error('Save error:', error));
}

/**
 * Send form data to Slack channel
 * @param {Object} data - Form data to send
 */
function sendToSlack(data) {
    const slackMessage = {
        text: `🚨 RED TAG Alert - New Form Submitted`,
        attachments: [{
            color: '#1976d2',
            fields: [
                { title: 'MFC', value: data.mfc, short: true },
                { title: 'Part Number', value: data.partNumber, short: true },
                { title: 'Asset SN', value: data.removedFrom, short: true },
                { title: 'Reason', value: data.reasonRemove, short: true },
                { title: 'Tagged By', value: data.taggedBy, short: true },
                { title: 'Date', value: data.removalDate, short: true }
            ]
        }]
    };

    fetch('https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXX', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
    })
    .then(response => {
        if (!response.ok) throw new Error('Slack webhook failed');
        console.log('Slack notification sent');
    })
    .catch(error => {
        console.error('Slack error:', error);
        showMessage('Slack notification failed.', 'error');
    });
}


/**
 * Print the current form
 */
function printForm() {
    window.print();
}

/**
 * Generate and download PDF version of the form
 */
async function saveAsPDF() {
    showMessage('Generating PDF. Please wait...', 'success');

    const formElement = document.getElementById('redTagForm');

    try {
        const canvas = await html2canvas(formElement);
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pageWidth - 20;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
        pdf.save('red-tag-form.pdf');

        showMessage('PDF downloaded successfully!', 'success');
    } catch (error) {
        console.error('PDF generation error:', error);
        showMessage('Failed to generate PDF.', 'error');
    }
}

/**
 * Export form database to Excel/CSV format
 */
function exportToExcel() {
    // Create CSV headers
    const headers = [
        'ID', 'MFC', 'Date', 'Tagged By', 'Item Type', 
        'Part Number', 'Asset SN', 'Service Call ID', 'Reason', 'Comments'
    ];
    
    // Convert data to CSV format
    const csvContent = [
        headers.join(','),
        ...formDatabase.map(row => [
            row.id || '',
            row.mfc || '',
            row.removalDate || row.date || '',
            row.taggedBy || '',
            row.itemType || '',
            row.partNumber || '',
            row.removedFrom || '',
            row.serviceCallId || '',
            row.reasonRemove || '',
            (row.comments || '').replace(/,/g, ';')
        ].join(','))
    ].join('\n');

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `red-tag-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showMessage('Excel export completed successfully!', 'success');
}

/**
 * Update the AI analytics dashboard with current data
 */
function updateAnalytics() {
    const analytics = performAIAnalysis(formDatabase);
    
    // Update UI elements with analytics results
    document.getElementById('topParts').innerHTML = formatTopItems(analytics.topParts);
    document.getElementById('topAssets').innerHTML = formatTopItems(analytics.topAssets);
    document.getElementById('failureTrends').innerHTML = formatTrends(analytics.trends);
    document.getElementById('mfcStats').innerHTML = formatMFCStats(analytics.mfcStats);
}

/**
 * Perform AI-powered analysis on the form database
 * @param {Array} data - Array of form submissions
 * @returns {Object} Analytics results
 */
function performAIAnalysis(data) {
    if (data.length === 0) {
        return {
            topParts: [{ name: 'No data yet', count: 0 }],
            topAssets: [{ name: 'No data yet', count: 0 }],
            trends: { trend: 'Insufficient data', recentCount: 0, totalCount: 0 },
            mfcStats: [{ name: 'No data yet', count: 0 }]
        };
    }

    // Initialize counting objects
    const partCounts = {};
    const assetCounts = {};
    const mfcCounts = {};
    const reasonCounts = {};

    // Count occurrences of each category
    data.forEach(record => {
        partCounts[record.partNumber] = (partCounts[record.partNumber] || 0) + 1;
        assetCounts[record.removedFrom] = (assetCounts[record.removedFrom] || 0) + 1;
        mfcCounts[record.mfc] = (mfcCounts[record.mfc] || 0) + 1;
        reasonCounts[record.reasonRemove] = (reasonCounts[record.reasonRemove] || 0) + 1;
    });

    // Get top 5 most frequent parts
    const topParts = Object.entries(partCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Get top 5 most problematic assets
    const topAssets = Object.entries(assetCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Get MFC statistics sorted by frequency
    const mfcStats = Object.entries(mfcCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([name, count]) => ({ name, count }));

    // Analyze trends (recent vs historical data)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentData = data.filter(record => {
        const recordDate = new Date(record.date || record.removalDate);
        return recordDate >= thirtyDaysAgo;
    });

    const trends = {
        trend: recentData.length > data.length * 0.6 ? 
            'Increasing failure rate' : 
            'Stable failure rate',
        recentCount: recentData.length,
        totalCount: data.length
    };

    return { topParts, topAssets, trends, mfcStats };
}

/**
 * Format top items (parts/assets) for display
 * @param {Array} items - Array of items with name and count
 * @returns {string} Formatted HTML string
 */
function formatTopItems(items) {
    if (items.length === 0 || items[0].count === 0) {
        return '<em style="color: #666;">No data available</em>';
    }

    return items.map((item, index) =>
        `<div style="margin: 5px 0; padding: 8px; background: ${index === 0 ? '#e3f2fd' : '#f5f5f5'}; border-radius: 5px; border-left: 3px solid ${index === 0 ? '#1976d2' : '#ddd'};">
            <strong>${item.name}</strong><br>
            <small>${item.count} occurrences</small>
        </div>`
    ).join('');
}
