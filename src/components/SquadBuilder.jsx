import React from 'react';
import PhotoAdjuster from './PhotoAdjuster.jsx';

export default function SquadBuilder({ people, onFiles, onUpdatePerson, onUpdatePersonAdjust, onRemovePerson }) {
  return (
    <div className="squad-builder">
      {people.map((person, idx) => (
        <div className="squad-card" key={idx}>
          <div className="squad-card-header">
            <span className="squad-index">BUILDER {String(idx + 1).padStart(2, '0')}</span>
            <button
              className="squad-remove"
              onClick={() => onRemovePerson(idx)}
              aria-label={`Remove builder ${idx + 1}`}
            >
              ✕
            </button>
          </div>
          {person.image ? (
            <>
              <PhotoAdjuster
                objectUrl={person.objectUrl}
                adjust={person.adjust}
                onChange={(newAdjust) => onUpdatePersonAdjust(idx, newAdjust)}
                compact
              />
              <button
                className="squad-thumb-replace-btn"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif';
                  input.onchange = (e) => {
                    if (e.target.files?.length) {
                      onFiles(e.target.files, idx);
                    }
                  };
                  input.click();
                }}
                aria-label={`Replace photo for builder ${idx + 1}`}
              >
                REPLACE PHOTO
              </button>
            </>
          ) : (
            <label className="squad-upload-mini" aria-label={`Upload photo for builder ${idx + 1}`}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
                onChange={(e) => {
                  if (e.target.files?.length) onFiles(e.target.files, idx);
                  e.target.value = '';
                }}
                style={{ display: 'none' }}
              />
              <span>+ PHOTO</span>
            </label>
          )}
          <input
            className="squad-input"
            type="text"
            value={person.name}
            onChange={(e) => onUpdatePerson(idx, 'name', e.target.value)}
            placeholder={`BUILDER ${idx + 1} NAME`}
            maxLength={48}
            aria-label={`Name for builder ${idx + 1}`}
          />
          <input
            className="squad-input"
            type="text"
            value={person.role}
            onChange={(e) => onUpdatePerson(idx, 'role', e.target.value)}
            placeholder="ROLE / STACK"
            maxLength={60}
            aria-label={`Role for builder ${idx + 1}`}
          />
        </div>
      ))}

      {people.length < 3 && (
        <label className="squad-add" aria-label="Add another builder">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif"
            onChange={(e) => {
              if (e.target.files?.length) onFiles(e.target.files, people.length);
              e.target.value = '';
            }}
            style={{ display: 'none' }}
          />
          <span className="squad-add-icon">+</span>
          <span className="squad-add-label">ADD TEAMMATE</span>
          <span className="squad-add-sub">{3 - people.length} slot{3 - people.length !== 1 ? 's' : ''} left</span>
        </label>
      )}
    </div>
  );
}
