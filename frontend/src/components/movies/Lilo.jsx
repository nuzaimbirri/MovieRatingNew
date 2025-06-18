import React from 'react';
import { FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Lilo = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      padding: '20px',
      color: '#fff',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        marginBottom: '32px'
      }}>        <img 
          src="/src/assets/lilo.webp"
          alt="Lilo & Stitch Banner"
          style={{
            width: '100%',
            height: '500px',
            objectFit: 'cover'
          }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
          padding: '32px'
        }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Lilo & Stitch (2025)</h1>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ 
              background: '#fbbf24', 
              color: '#000', 
              padding: '4px 12px', 
              borderRadius: '16px',
              fontWeight: 'bold'
            }}>
              71%
            </span>
            <span>1h 41m</span>
            <span>Family, Comedy, Science Fiction, Adventure</span>
          </div>          <button 
            onClick={() => {
              window.open('https://www.youtube.com/watch?v=VWqJifMMgZE', '_blank');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fbbf24',
              color: '#000',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '24px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              ':hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <FaPlay /> Play Trailer
          </button>
        </div>
      </div>

      {/* Overview Section */}
      <div style={{
        background: '#1e1e1e',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '32px'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '16px',
          color: '#fbbf24'
        }}>Overview</h2>
        <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
          The wildly funny and touching story of a lonely Hawaiian girl and the fugitive alien who helps to mend her broken family.
        </p>
      </div>

      {/* Credits Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px'
      }}>
        <div style={{
          background: '#1e1e1e',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '8px' }}>Dean Fleischer Camp</h3>
          <p>Director</p>
        </div>
        <div style={{
          background: '#1e1e1e',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '8px' }}>Chris Kekaniokalani Bright</h3>
          <p>Screenplay</p>
        </div>
        <div style={{
          background: '#1e1e1e',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ color: '#fbbf24', marginBottom: '8px' }}>Mike Van Waes</h3>
          <p>Screenplay</p>
        </div>
      </div>
    </div>
  );
};

export default Lilo;