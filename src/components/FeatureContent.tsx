'use client'
import React from 'react';

export default function FeatureContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">仕事の魅力</h3>
        <p className="text-gray-600">
          自由な働き方と安定した収入。お客様との出会いが毎日の励みになります。
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">業界動向</h3>
        <p className="text-gray-600">
          デジタル化が進み、より効率的な配車システムの導入で働きやすい環境に。
        </p>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-4">成功事例</h3>
        <p className="text-gray-600">
          未経験からスタートして、今では月収50万円以上も夢ではありません。
        </p>
      </div>
    </div>
  );
} 