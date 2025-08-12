"use client";

const DocPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Documentation</h1>
      <p className="text-lg mb-8">
        Welcome to the documentation page. Here you will find all the information you need to use our services.
      </p>

      {/* Cardiac MRI (Short Axis) Section */}
      <section className="my-12">
        <h2 className="text-2xl font-bold mb-6">Cardiac MRI (Short Axis) Analysis</h2>
        
        {/* 2D Heart Illustration */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Heart Anatomy Overview</h3>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="lg:w-1/3">
              <img 
                src="/2dheart.png" 
                alt="2D Heart Anatomical Illustration" 
                className="w-full h-auto rounded-lg shadow-md border"
              />
            </div>
            <div className="lg:w-2/3">
              <p className="text-gray-700 leading-relaxed">
                This scientific illustration shows the anatomical structure of the human heart, providing a foundational 
                understanding of cardiac anatomy essential for interpreting MRI segmentation results. The diagram highlights 
                the key cardiac components that are segmented in our AI-powered analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Cardiac States Comparison */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Cardiac Cycle: Relaxation vs Contraction</h3>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="lg:w-1/2">
              <img 
                src="/cardiacshortaxis-1.jpg" 
                alt="Heart States - Relaxed vs Contracted" 
                className="w-full h-auto rounded-lg shadow-md border"
              />
            </div>
            <div className="lg:w-1/2">
              <p className="text-gray-700 leading-relaxed mb-4">
                This image demonstrates the fundamental cardiac cycle phases through anatomical diagrams:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800">Left Side - Relaxed (Diastole):</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Heart muscle and ventricular walls are expanded</li>
                    <li>Ventricular cavities are larger, filled with blood</li>
                    <li>Muscle fibers are elongated</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Right Side - Contracted (Systole):</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Ventricles in contracted phase</li>
                    <li>Ventricular walls are thicker, cavities smaller</li>
                    <li>Muscle fibers shortened for blood pumping</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MRI Segmentation Analysis */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">MRI Segmentation at Multiple Levels</h3>
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="lg:w-1/2">
              <img 
                src="/cardiacshortaxis-2.png" 
                alt="Cardiac MRI Segmentation - Basal, Mid-slice, and Apical Levels" 
                className="w-full h-auto rounded-lg shadow-md border"
              />
            </div>
            <div className="lg:w-1/2">
              <p className="text-gray-700 leading-relaxed mb-4">
                This comprehensive view links anatomical models to real MRI imaging and AI-powered segmentation:
              </p>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800">Left Side - Anatomical Reference:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                    <li>Heart in relaxed (diastolic) state</li>
                    <li>Blue arrows indicate MRI slice locations</li>
                    <li>Shows ventricles and myocardial muscle fibers</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Right Side - MRI Analysis:</h4>
                  <div className="text-sm text-gray-600 space-y-2 ml-4">
                    <p><strong>Three levels analyzed:</strong> Basal, Mid-slice, and Apical</p>
                    <p><strong>Segmentation Color Coding:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>Red (RV) - Right Ventricle</li>
                      <li><span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-2"></span>Yellow (MYO) - Myocardium</li>
                      <li><span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>Blue (LV) - Left Ventricle</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default DocPage;