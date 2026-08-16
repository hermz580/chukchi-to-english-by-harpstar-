import React, { useEffect } from 'react';

const HarpStarBranding: React.FC = () => {
    useEffect(() => {
        // Integrity check: Verify branding exists in DOM
        const branding = document.getElementById('harpstar-branding');
        if (!branding) {
            console.error("HarpStar branding missing!");
            document.body.innerHTML = "<h1>This app requires HarpStar branding. Visit harpstarunlimited.com.</h1>";
        }
    }, []);

    return (
        <div id="harpstar-branding" className="fixed bottom-4 right-4 text-xs font-bold animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-500 to-yellow-500">
            by Harp★Star
        </div>
    );
};

export default HarpStarBranding;
