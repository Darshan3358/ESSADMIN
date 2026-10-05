/**
 * Helper to build comprehensive multi-field search conditions for Orders
 * Supports:
 * - Store Name (supplier_name, storehouse, and seller shop_name)
 * - Client Name (customer_name, email, phone, address)
 * - Amount (order_total partial string match and exact numeric match)
 * - Date (createdAt, deliveredAt in YYYY-MM-DD, DD/MM/YYYY, month names, etc.)
 * - Order Code
 */
function buildOrderSearchOr(keyword, matchedSellerIds = []) {
    if (!keyword) return [];
    const trimmed = String(keyword).trim();
    if (!trimmed) return [];

    const searchRegex = { $regex: trimmed, $options: 'i' };

    const orConditions = [
        { customer_name: searchRegex },
        { order_code: searchRegex },
        { customer_email: searchRegex },
        { customer_phone: searchRegex },
        { customer_address: searchRegex },
        { supplier_name: searchRegex },
        { created_at: searchRegex }
    ];

    if (matchedSellerIds && matchedSellerIds.length > 0) {
        orConditions.push({ seller_id: { $in: matchedSellerIds } });
    }

    // Store Name: "storehouse", "esssmart", "ess smart" matching default storehouse
    if (/storehouse|esssmart|ess\s*smart|store\s*house/i.test(trimmed)) {
        orConditions.push(
            { supplier_name: { $in: [null, '', undefined] } },
            { supplier_name: { $exists: false } }
        );
    }

    // Amount matching (e.g. "$312.97", "312", "120.00")
    const cleanNum = trimmed.replace(/[\$,\s€₹]/g, '');
    if (cleanNum && !isNaN(cleanNum) && cleanNum.length > 0) {
        const numVal = parseFloat(cleanNum);
        if (!isNaN(numVal)) {
            orConditions.push({ order_total: numVal });
        }
        orConditions.push({
            $expr: {
                $regexMatch: {
                    input: { $toString: '$order_total' },
                    regex: cleanNum.replace('.', '\\.'),
                    options: 'i'
                }
            }
        });
    }

    // Date matching
    const dateLike = trimmed.replace(/\//g, '-');
    const parts = dateLike.split('-');
    const datePatterns = [trimmed, dateLike];

    if (parts.length === 3) {
        if (parts[0].length === 2 && parts[2].length === 4) {
            datePatterns.push(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
            datePatterns.push(`${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`);
        } else if (parts[0].length === 4) {
            datePatterns.push(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`);
        }
    } else if (parts.length === 2 && parts[0].length === 4) {
        datePatterns.push(`${parts[0]}-${parts[1].padStart(2, '0')}`);
    }

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const monthIdx = months.findIndex(m => trimmed.toLowerCase().includes(m));
    if (monthIdx !== -1) {
        const monthNum = String(monthIdx + 1).padStart(2, '0');
        datePatterns.push(`-${monthNum}-`);
    }

    const uniqueDatePatterns = [...new Set(datePatterns.filter(Boolean))];
    uniqueDatePatterns.forEach(pat => {
        orConditions.push({
            $expr: {
                $regexMatch: {
                    input: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    regex: pat,
                    options: 'i'
                }
            }
        });
        orConditions.push({
            $expr: {
                $regexMatch: {
                    input: { $dateToString: { format: '%Y-%m-%d', date: { $ifNull: ['$deliveredAt', '$createdAt'] } } },
                    regex: pat,
                    options: 'i'
                }
            }
        });
    });

    return orConditions;
}

module.exports = { buildOrderSearchOr };
