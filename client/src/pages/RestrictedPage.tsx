import React from 'react';
import { Link } from 'react-router-dom';

const RestrictedPage: React.FC = () => {
    return (
        <div className="restricted-page">
            <h1>Access Restricted</h1>
            <p>You don't have access to this feature with your current plan.</p>
            <p>Please upgrade your subscription to access this feature.</p>
            <Link to="/" className="btn btn-primary">
                Back to Home
            </Link>
        </div>
    );
};

export default RestrictedPage;
