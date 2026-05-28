import React from 'react';

export default function AuthLayout({ children, icon: Icon, title, subtitle, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            {Icon && <Icon className="w-6 h-6 text-primary-foreground" />}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          {children}
        </div>

        {footer && (
          <div className="text-center text-sm text-muted-foreground font-medium">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
