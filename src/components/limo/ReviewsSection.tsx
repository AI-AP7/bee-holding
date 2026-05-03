"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import VideoCarousel from "./VideoCarousel";

const reviews = [
  {
    id: "1",
    name: "Verified Customer",
    rating: 5,
    comment: "My daughter was absolutely in love with the experience and now wants me to use your Company on all our future affairs. Sir, you are to be complimented for your exceptional customer service skills and for making her dreams come true.",
    category: "Special Event",
  },
  {
    id: "2",
    name: "Dylan",
    rating: 5,
    comment: "I had an excellent experience with UFirst limo service. Will get you exactly where you need to be in a pleasurable and fashionable manner.",
    category: "Professional Service",
  },
  {
    id: "3",
    name: "Jackson",
    rating: 5,
    comment: "Great limo great price. The limo owner was super professional and played great music.",
    category: "Luxury Transport",
  },
  {
    id: "4",
    name: "Kristen Brooks",
    rating: 5,
    comment: "It was a overall great experience, the limo was there on time and the driver was awesome and reasonably priced. Thank you again.",
    category: "Limousine Hire",
  },
  {
    id: "5",
    name: "Abigail",
    rating: 5,
    comment: "Great experience! Safe drive there and back and it was very cool overall!",
    category: "Safe & Cool Ride",
  },
];

export default function ReviewsSection() {
  const [showAll, setShowAll] = useState(false);
  const displayedReviews = showAll ? reviews : reviews.slice(0, 2);

  return (
    <section id="reviews" className="py-24 px-6 md:px-12 lg:px-24 bg-surface-low">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex items-end justify-between"
        >
          <div>
            <p
              className="text-lime text-xs uppercase tracking-widest mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Client Testimonials
            </p>
            <h2
              className="text-display text-4xl md:text-5xl text-primary"
              style={{ fontFamily: "var(--font-display)" }}
            >
              REVIEWS
            </h2>
          </div>
          
          {/* Aggregate Rating */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-4xl font-bold text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                5.0
              </p>
              <p className="text-sm text-on-surface-variant">Average Rating</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="#BDDB37"
                  className="text-lime"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reviews Content */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Video Carousel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <VideoCarousel />
          </motion.div>

          {/* Reviews Grid */}
          <div className="space-y-6">
            {displayedReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-surface-high rounded-xl p-8 ghost-border"
              >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill={star <= review.rating ? "#BDDB37" : "none"}
                    stroke={star <= review.rating ? "#BDDB37" : "currentColor"}
                    strokeWidth="2"
                    className={star <= review.rating ? "text-lime" : "text-outline"}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              {/* Comment */}
              <p className="text-on-surface mb-6 leading-relaxed">
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-primary">{review.name}</p>
                </div>
                <div className="px-3 py-1 bg-surface-mid rounded-full">
                  <p className="text-xs uppercase tracking-wider text-lime" style={{ fontFamily: "var(--font-mono)" }}>
                    {review.category}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Show More */}
        {reviews.length > 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <button
              onClick={() => setShowAll(!showAll)}
              className="btn-ghost px-8 py-3"
            >
              {showAll ? "Show Less" : `View All ${reviews.length} Reviews`}
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
