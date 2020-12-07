/**
 *      Given a record and a field, return a user-friendly string representation
 */
Ext.define('CustomAgile.ui.renderer.RecordFieldRendererFactory', {
    singleton: true,

    colorPalette: {
        '#105cab': 'Dark Blue',
        '#21a2e0': 'Blue',
        '#107c1e': 'Green',
        '#4a1d7e': 'Purple',
        '#df1a7b': 'Pink',
        '#ee6c19': 'Burnt Orange',
        '#f9a814': 'Orange',
        '#fce205': 'Yellow',
        '#848689': 'Grey'
    },

    getFieldDisplayValue: function (record, field, delimiter, cleanseForExport) {
        if (!record || !field) {
            return '';
        }

        let val = record.get ? record.get(field) : record[field];
        let d = delimiter || ', ';

        if (_.isUndefined(val) || val === null) {
            val = '';
        }
        else if (typeof val === 'boolean') {
            val = val.toString();
        }
        else if (Ext.isDate(val)) {
            val = Rally.util.DateTime.formatWithDefaultDateTime(val);
        }
        else if (field === 'DisplayColor') {
            val = this.colorPalette[val] || val;
        }
        else if (field === 'Parent') {
            if (val && val.FormattedID && val.Name) {
                val = val.FormattedID + ': ' + val.Name;
            } else if (val && val._refObjectName) {
                val = val._refObjectName;
            } else if (record.get && record.get('Feature') && record.get('Feature').FormattedID && record.get('Feature').Name) {
                val = record.get('Feature').FormattedID + ': ' + record.get('Feature').Name;
            } else if (record.Feature && record.Feature.FormattedID && record.Feature.Name) {
                val = record.Feature.FormattedID + ': ' + record.Feature.Name;
            } else {
                val = 'No Parent';
            }
        }
        else if (field === 'Release') {
            val = (val && val.Name) || 'Unscheduled';
        }
        else if (field === 'Project') {
            val = (val && val.Name) || 'Failed to convert project field';
        }
        else if (field === 'Predecessors' || field === 'Successors') {
            val = typeof val === 'object' && typeof val.Count === 'number' ? val.Count : '';
        }
        else if (field === 'PredecessorsAndSuccessors') {
            val = typeof val.Predecessors === 'number' ? `Predecessors: ${val.Predecessors}; Successors: ${val.Successors}` : '';
        }
        else if (field === 'Owner' || field === 'CreatedBy') {
            val = (val && (val.DisplayName || (val.FirstName && val.LastName && `${val.FirstName} ${val.LastName}`) || val._refObjectName)) || "";

            if (!val && field === 'Owner') {
                val = 'No Owner';
            }
        }
        else if (field === 'PreliminaryEstimate') {
            val = `${val.Name} (${val.Value})`;
        }
        else if (field === 'Milestones') {
            if (val.Count) {
                val = _.map(val._tagsNameArray, (m) => {
                    return `${m.FormattedID}: ${m.Name}`;
                });
                val = val.join(d);
            }
            else {
                val = 'None';
            }
        }
        else if (field.toLowerCase().indexOf('portfolioitem/') > -1 || field === 'Feature') {
            val = val && `${val.FormattedID}: ${val.Name}` || 'None';
        }
        else if (typeof val === 'object') {
            if (val._tagsNameArray) {
                val = _.map(val._tagsNameArray, (m) => {
                    return m.Name || m.Value;
                });
                val = val.join(d);
            }
            else {
                val = val.Name || val.value || val._refObjectName || 'Unable to convert field for export';
            }
        }
        else if (_.isArray(val)) {
            val = val.join(d);
        }

        if (cleanseForExport) {
            val = this.cleanseExportValue(val.toString());
        }

        return val;
    },

    cleanseExportValue(val) {
        let reHTML = new RegExp('<\/?[^>]+>', 'gi');
        let reNbsp = new RegExp('&nbsp;', 'gi');

        if (reHTML.test(val)) {
            val = val.replace('<br>', '\r\n');
            val = Ext.util.Format.htmlDecode(val);
            val = Ext.util.Format.stripTags(val);
        }
        val = val.replace(reNbsp, ' ');

        return val;
    }
});