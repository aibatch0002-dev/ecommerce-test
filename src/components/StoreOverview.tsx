import React from 'react';
import {
  MapPin,
  Clock,
  ShoppingBag,
  Apple,
  Coffee,
  Shirt,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Car,
  HeartHandshake,
} from 'lucide-react';

export const StoreOverview: React.FC = () => {
  const departments = [
    {
      icon: Apple,
      nameEn: 'Fresh Produce & Organic Fruits',
      nameBn: 'টাটকা শাকসবজি ও ফলমূল',
      desc: 'Farm-fresh daily harvest, crisp organic greens, seasonal fruits, and temperature-controlled mist preservation.',
    },
    {
      icon: Coffee,
      nameEn: 'Pantry Groceries & Dairy',
      nameBn: 'গ্রোসারি ও দুগ্ধজাত খাদ্য',
      desc: 'Imported and local pantry essentials, specialty spices, bakery goods, and dairy products.',
    },
    {
      icon: Sparkles,
      nameEn: 'Beverage Chillers & Snacks',
      nameBn: 'চিল্ড বেভারেজ ও স্ন্যাক্স',
      desc: 'Refreshing soft drinks, juices, energy beverages, packaged gourmet snacks, and confectioneries.',
    },
    {
      icon: Shirt,
      nameEn: 'Fashion & Household Lifestyle',
      nameBn: 'পোশাক ও গৃহস্থালি পণ্য',
      desc: 'Quality everyday family apparel, cookware, hygiene essentials, cleaning products, and decor.',
    },
  ];

  const highlights = [
    {
      icon: ShieldCheck,
      title: '100% Quality Assurance',
      desc: 'Strict freshness and food safety inspection on every shelf item.',
    },
    {
      icon: CreditCard,
      title: 'Fast Cashless Checkout',
      desc: 'Instant bKash, Nagad, Mastercard, and Visa digital POS counters.',
    },
    {
      icon: Car,
      title: 'Ample Dedicated Parking',
      desc: 'Hassle-free parking plaza right in front of the supermarket entrance.',
    },
    {
      icon: HeartHandshake,
      title: 'Together for Better Living',
      desc: 'Community-first pricing with exclusive family loyalty rewards.',
    },
  ];

  return (
    <section id="store-guide" className="w-full max-w-[1080px] mx-auto py-12 px-4">
      {/* Branch Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1.5 uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>Rajshahi Flagship Branch</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-neutral-100">
            UNITY SUPER SHOP
          </h2>
          <p className="text-sm text-neutral-400 font-bengali mt-1">
            উপশহর, নিউমার্কেট, রাজশাহী · "Together for Better Living"
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-neutral-300 bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-xl">
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold block text-neutral-100">Store Hours: 8:00 AM – 11:00 PM</span>
            <span className="text-neutral-500">Open 7 Days a Week (Including Holidays)</span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="mb-10">
        <h3 className="text-base font-bold text-neutral-200 mb-4 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>Supermarket Departments</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((dept, i) => {
            const Icon = dept.icon;
            return (
              <div
                key={i}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-100 mb-0.5">
                    {dept.nameEn}
                  </h4>
                  <h5 className="text-xs font-semibold text-amber-400/90 font-bengali mb-2">
                    {dept.nameBn}
                  </h5>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {dept.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Store Highlights Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.map((h, i) => {
          const Icon = h.icon;
          return (
            <div
              key={i}
              className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-neutral-800 text-amber-400 shrink-0 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-neutral-200 mb-1">
                  {h.title}
                </h4>
                <p className="text-[11px] text-neutral-400 leading-snug">
                  {h.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Address & Trust Banner */}
      <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900/90 to-amber-950/20 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono text-amber-400 font-semibold tracking-wider">
            Visit Us in Rajshahi
          </span>
          <h4 className="text-base font-bold text-neutral-100 font-bengali mt-0.5">
            উপশহর, নিউমার্কেট এলাকা, রাজশাহী - ৬০০০, বাংলাদেশ
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5">
            Located next to main New Market Road, accessible by public and private transport.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span>Toll-Free Customer Care:</span>
          <span className="text-amber-400 font-bold">+880 1700-UNITY</span>
        </div>
      </div>
    </section>
  );
};
