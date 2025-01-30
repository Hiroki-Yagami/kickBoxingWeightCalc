// 体格分析クラス
class PhysicalAnalyzer {
  constructor(height, weight, reach) {
    this.height = height;
    this.weight = weight;
    this.reach = reach;
  }

  calculateBMI() {
    return this.weight / Math.pow(this.height / 100, 2);
  }

  calculateReachAdvantage() {
    const averageReach = this.height * 1.02;
    return this.reach - averageReach;
  }

  determineWeightClass() {
    const weightClasses = [
      { name: "ストロー級", limit: 52.2 },
      { name: "フライ級", limit: 56.7 },
      { name: "バンタム級", limit: 61.2 },
      { name: "フェザー級", limit: 65.8 },
      { name: "ライト級", limit: 70.3 },
      { name: "ウェルター級", limit: 77.1 },
      { name: "ミドル級", limit: 83.9 },
      { name: "ライトヘビー級", limit: 93.0 },
      { name: "ヘビー級", limit: Infinity },
    ];

    return weightClasses.find((wc) => this.weight <= wc.limit);
  }
}

// コンディション管理クラス
class ConditionMonitor {
  constructor() {
    this.dailyData = JSON.parse(localStorage.getItem("conditionData")) || [];
  }

  logCondition(data) {
    this.dailyData.push({
      date: new Date().toISOString(),
      ...data,
    });
    localStorage.setItem("conditionData", JSON.stringify(this.dailyData));
  }

  analyzeConditionTrend() {
    const recentData = this.dailyData.slice(-7);
    return {
      sleepAverage: this.calculateAverage(recentData.map((d) => d.sleep)),
      fatigueAverage: this.calculateAverage(recentData.map((d) => d.fatigue)),
      motivationAverage: this.calculateAverage(
        recentData.map((d) => d.motivation)
      ),
    };
  }

  calculateAverage(numbers) {
    return numbers.length
      ? numbers.reduce((a, b) => a + b) / numbers.length
      : 0;
  }
}

// 栄養管理クラス
class NutritionManager {
  constructor(weight, activityLevel) {
    this.weight = weight;
    this.activityLevel = activityLevel;
  }

  calculateNutrition() {
    const bmr = this.weight * 24;
    const tdee = bmr * this.activityLevel;

    return {
      maintenance: Math.round(tdee),
      cutting: Math.round(tdee * 0.8),
      protein: Math.round(this.weight * 2.2),
      carbs: Math.round((tdee * 0.4) / 4),
      fats: Math.round((tdee * 0.2) / 9),
    };
  }
}

// UI操作関数
function analyzePhysical() {
  const height = parseFloat(document.getElementById("height").value);
  const weight = parseFloat(document.getElementById("weight").value);
  const reach = parseFloat(document.getElementById("reach").value);

  if (!height || !weight || !reach) {
    alert("すべての項目を入力してください");
    return;
  }

  const analyzer = new PhysicalAnalyzer(height, weight, reach);
  const weightClass = analyzer.determineWeightClass();
  const bmi = analyzer.calculateBMI();
  const reachAdvantage = analyzer.calculateReachAdvantage();

  const resultHtml = `
    <h3>分析結果</h3>
    <p>適正階級: ${weightClass.name}</p>
    <p>BMI: ${bmi.toFixed(1)}</p>
    <p>リーチアドバンテージ: ${reachAdvantage.toFixed(1)}cm</p>
  `;

  document.getElementById("physical-result").innerHTML = resultHtml;
}

function logCondition() {
  const sleep = parseFloat(document.getElementById("sleep").value);
  const fatigue = parseInt(document.getElementById("fatigue").value);
  const motivation = parseInt(document.getElementById("motivation").value);
  const injuries = document.getElementById("injuries").value;

  if (!sleep) {
    alert("睡眠時間を入力してください");
    return;
  }

  const monitor = new ConditionMonitor();
  monitor.logCondition({ sleep, fatigue, motivation, injuries });
  const trend = monitor.analyzeConditionTrend();

  const resultHtml = `
    <h3>過去7日間の傾向</h3>
    <p>平均睡眠時間: ${trend.sleepAverage.toFixed(1)}時間</p>
    <p>平均疲労度: ${trend.fatigueAverage.toFixed(1)}</p>
    <p>平均モチベーション: ${trend.motivationAverage.toFixed(1)}</p>
  `;

  document.getElementById("condition-result").innerHTML = resultHtml;
}

function calculateNutrition() {
  const weight = parseFloat(document.getElementById("weight").value);
  const activityLevel = parseFloat(
    document.getElementById("activity-level").value
  );

  if (!weight) {
    alert("体重を入力してください");
    return;
  }

  const manager = new NutritionManager(weight, activityLevel);
  const plan = manager.calculateNutrition();

  const resultHtml = `
    <h3>栄養摂取目安</h3>
    <p>維持カロリー: ${plan.maintenance}kcal</p>
    <p>減量期カロリー: ${plan.cutting}kcal</p>
    <p>タンパク質: ${plan.protein}g</p>
    <p>炭水化物: ${plan.carbs}g</p>
    <p>脂質: ${plan.fats}g</p>
  `;

  document.getElementById("nutrition-result").innerHTML = resultHtml;
}

// p5.jsのアニメーション設定
new p5(function (p) {
  let particles = [];
  let numParticles = 30;

  p.setup = function () {
    let header = document.querySelector("header");
    let canvas = p.createCanvas(p.windowWidth, header.offsetHeight);
    canvas.parent("canvas-container");
    p.background(0);

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  };

  p.draw = function () {
    p.background(0, 15);

    for (let particle of particles) {
      particle.update();
      particle.display();
    }
  };

  class Particle {
    constructor() {
      this.position = p.createVector(p.random(p.width), p.random(p.height));
      this.velocity = p5.Vector.random2D().mult(2);
      this.color = p.color(255, 23, 68, 150);
      this.size = p.random(3, 8);
    }

    update() {
      this.position.add(this.velocity);
      if (this.position.x < 0) this.position.x = p.width;
      if (this.position.x > p.width) this.position.x = 0;
      if (this.position.y < 0) this.position.y = p.height;
      if (this.position.y > p.height) this.position.y = 0;
    }

    display() {
      p.noStroke();
      p.fill(this.color);
      p.ellipse(this.position.x, this.position.y, this.size);
    }
  }

  p.windowResized = function () {
    let header = document.querySelector("header");
    p.resizeCanvas(p.windowWidth, header.offsetHeight);
  };
});
