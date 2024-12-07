/**
 * @license
 * Color Mixing Algorithm
 * Copyright (c) 2024 horushe93
 * 
 * This work is licensed under the Creative Commons Attribution-NonCommercial 4.0
 * International License. To view a copy of this license, visit:
 * http://creativecommons.org/licenses/by-nc/4.0/
 * 
 * Requirements:
 * - Attribution — You must give appropriate credit, provide a link to the license,
 *   and indicate if changes were made.
 * - NonCommercial — You may not use the material for commercial purposes.
 */

import { Color, ColorMix } from "./types";

/**
 * Mixes multiple colors according to their proportions
 * @param colorMixes Array of color and proportion combinations to mix
 * @throws {Error} If color proportions don't sum up to 100%
 * @returns {Color} The resulting mixed color
 */
export function mixColors(colorMixes: ColorMix[]): Color {
  // Ensure proportions sum up to 100%
  const totalProportion = colorMixes.reduce((sum, mix) => sum + mix.proportion, 0);
  if (Math.abs(totalProportion - 100) > 0.001) {
    throw new Error('Color proportions must sum up to 100%');
  }

  // Mix colors
  const mixedColor: Color = {
    red: 0,
    blue: 0,
    green: 0
  };

  colorMixes.forEach(mix => {
    mixedColor.red += (mix.color.red * mix.proportion) / 100;
    mixedColor.blue += (mix.color.blue * mix.proportion) / 100;
    mixedColor.green += (mix.color.green * mix.proportion) / 100;
  });
  return mixedColor;
}

/**
 * Mix colors and compare similarity between two color mixes
 * @param colorMixes List of color mixing proportions to compare
 * @param targetColorMixes List of target color mixing proportions to compare against
 * @returns {number} Similarity percentage (0-100) where:
 *                   - 100 means exact match
 *                   - 0 means completely different
 *                   Final score is weighted: 60% color similarity, 40% proportion match
 */
export function mixColorsAndCompare(colorMixes: ColorMix[], targetColorMixes: ColorMix[]): number {
  // Check for exact match
  const isExactMatch = colorMixes.every((mix, index) => {
    const targetMix = targetColorMixes[index];
    return Math.abs(mix.proportion - targetMix.proportion) < 0.001 &&
           checkColorIsEqual(mix.color, targetMix.color);
  });
  
  if (isExactMatch) {
    return 100;
  }

  // Calculate mixed color similarity
  const mixedColor = mixColors(colorMixes);
  const targetColor = mixColors(targetColorMixes);
  
  // Calculate RGB color distance (using Euclidean distance)
  const colorDistance = Math.sqrt(
    Math.pow(mixedColor.red - targetColor.red, 2) +
    Math.pow(mixedColor.green - targetColor.green, 2) +
    Math.pow(mixedColor.blue - targetColor.blue, 2)
  );
  
  // Convert distance to similarity score (0-100)
  // Maximum possible RGB distance is sqrt(255^2 * 3) ≈ 441.67
  const maxDistance = Math.sqrt(195075); // sqrt(255^2 * 3)
  const colorSimilarity = Math.max(0, 100 * (1 - colorDistance / maxDistance));

  // Calculate proportion combination match
  let proportionMatch = 0;
  const usedTargets = new Set<number>();

  colorMixes.forEach(mix => {
    // Find best match for target color and proportion combination
    let bestMatch = {
      index: -1,
      score: 0
    };

    targetColorMixes.forEach((target, index) => {
      if (usedTargets.has(index)) return;
      
      // Calculate color match score (0-1)
      const colorMatchScore = 1 - (
        Math.abs(mix.color.red - target.color.red) +
        Math.abs(mix.color.green - target.color.green) +
        Math.abs(mix.color.blue - target.color.blue)
      ) / (255 * 3);
      
      // Calculate proportion match score (0-1)
      const proportionMatchScore = 1 - Math.abs(mix.proportion - target.proportion) / 100;
      
      // Total score
      const totalScore = (colorMatchScore * 0.7 + proportionMatchScore * 0.3) * 100;
      
      if (totalScore > bestMatch.score) {
        bestMatch = {
          index: index,
          score: totalScore
        };
      }
    });

    if (bestMatch.index !== -1) {
      usedTargets.add(bestMatch.index);
      proportionMatch += bestMatch.score;
    }
  });

  proportionMatch = proportionMatch / colorMixes.length;

  // Final score: color similarity 60%, proportion match 40%
  return Math.round(colorSimilarity * 0.6 + proportionMatch * 0.4);
}

/**
 * Checks if two colors are exactly equal
 * @param color1 First color to compare
 * @param color2 Second color to compare
 * @returns {boolean} True if colors have identical RGB values, false otherwise
 */
export function checkColorIsEqual(color1: Color, color2: Color): boolean {
  return color1.red === color2.red && color1.blue === color2.blue && color1.green === color2.green;
}
