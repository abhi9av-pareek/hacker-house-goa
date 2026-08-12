import React from 'react';

export default function BuilderForm({ profile, onChange, builderClass }) {
  return (
    <div className="builder-form">
      <div className="form-field">
        <label htmlFor="builder-name" className="field-label">NAME</label>
        <input
          id="builder-name"
          className="field-input"
          type="text"
          value={profile.name}
          onChange={(e) => onChange({ ...profile, name: e.target.value })}
          placeholder="ABHINAV PAREEK"
          maxLength={48}
          autoComplete="name"
        />
      </div>

      <div className="form-field">
        <label htmlFor="builder-role" className="field-label">STACK / ROLE</label>
        <input
          id="builder-role"
          className="field-input"
          type="text"
          value={profile.role}
          onChange={(e) => onChange({ ...profile, role: e.target.value })}
          placeholder="FULL STACK DEVELOPER"
          maxLength={60}
        />
      </div>

      <div className="class-display" aria-live="polite">
        <div className="class-display-label">GENERATED BUILDER CLASS</div>
        <div className="class-display-title">{builderClass.title}</div>
        <div className="class-display-code">{builderClass.code}</div>
      </div>
    </div>
  );
}
