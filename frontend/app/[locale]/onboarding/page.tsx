'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Phone, Store, MapPin, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface FormData {
  phoneNumber: string;
  restaurantName: string;
  totalTables: string;
}

interface Region {
  name: string;
  startNumber: string;
  endNumber: string;
}

interface Errors {
  phoneNumber?: string;
  restaurantName?: string;
  totalTables?: string;
  tableRegions?: string;
}

export default function RestaurantOnboarding() {
  const t = useTranslations('Onboarding');
  const { update } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    restaurantName: '',
    totalTables: ''
  });
  const [tableRegions, setTableRegions] = useState<Region[]>([]);
  const [showRegionDialog, setShowRegionDialog] = useState(false);
  const [regionForm, setRegionForm] = useState<Region>({
    name: '',
    startNumber: '',
    endNumber: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [regionError, setRegionError] = useState<string | null>(null);

  const steps = [
    { icon: Phone, title: t('contactInfoTitle'), description: t('contactInfoDescription') },
    { icon: Store, title: t('restaurantDetailsTitle'), description: t('restaurantDetailsDescription') },
    { icon: MapPin, title: t('tableLayoutTitle'), description: t('tableLayoutDescription') },
    { icon: Check, title: t('allSetTitle'), description: t('allSetDescription') }
  ];

  const validateStep = (step: number) => {
    const newErrors: Errors = {};
    
    switch(step) {
      case 0:
        if (!formData.phoneNumber || !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = t('phoneNumberRequired');
        }
        break;
      case 1:
        if (!formData.restaurantName.trim()) {
          newErrors.restaurantName = t('restaurantNameRequired');
        }
        if (!formData.totalTables || parseInt(formData.totalTables) < 1) {
          newErrors.totalTables = t('totalTablesRequired');
        }
        break;
      case 2:
        if (tableRegions.length === 0) {
          newErrors.tableRegions = t('tableRegionRequired');
        }
        const totalRegionTables = tableRegions.reduce((sum, region) => {
          return sum + (parseInt(region.endNumber) - parseInt(region.startNumber) + 1);
        }, 0);
        if (totalRegionTables !== parseInt(formData.totalTables)) {
          newErrors.tableRegions = t('tableRegionMismatch', { totalRegionTables, totalTables: formData.totalTables });
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOnboardingSubmit = async () => {
    setIsLoading(true);
    try {
      // Transform the tableRegions data into the format expected by the backend
      const tables = tableRegions.flatMap(region => {
        const regionTables = [];
        for (let i = parseInt(region.startNumber); i <= parseInt(region.endNumber); i++) {
          regionTables.push({
            name: `${region.name} ${i}`,
            capacity: 2, // Default capacity
          });
        }
        return regionTables;
      });

      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          restaurantName: formData.restaurantName,
          tables,
        }),
      });

      if (response.ok) {
        const { restaurant_id: restaurantId } = await response.json();
        setShowSuccess(true);
        
        // Update the session with the new restaurant_id
        if (update) {
          await update({
            restaurant_id: restaurantId,
            onboarding_completed: true,
          });
        }
        
        // Redirect to the admin page after a short delay
        setTimeout(() => {
          const locale = window.location.pathname.split('/')[1];
          window.location.href = `/${locale}/${restaurantId}/admin/dashboard`;
        }, 2000);
      } else {
        // Handle error
        console.error('Onboarding failed');
      }
    } catch (error) {
      console.error('An error occurred during onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleOnboardingSubmit();
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const addTableRegion = () => {
    if (!regionForm.name || !regionForm.startNumber || !regionForm.endNumber) {
      setRegionError("All fields are required.");
      return;
    }
    if (parseInt(regionForm.endNumber) < parseInt(regionForm.startNumber)) {
      setRegionError("End table number must be greater than or equal to the start number.");
      return;
    }
    setTableRegions([...tableRegions, { ...regionForm }]);
    setRegionForm({ name: '', startNumber: '', endNumber: '' });
    setShowRegionDialog(false);
    setRegionError(null);
  };

  const removeTableRegion = (index: number) => {
    setTableRegions(tableRegions.filter((_, i) => i !== index));
  };

  const getStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('welcomeTitle')} 🎉
                </h2>
                <p className="text-gray-600 mt-2">{t('welcomeDescription')}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-lg font-medium">{t('phoneNumberLabel')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('phoneNumberPlaceholder')}
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  className={`mt-2 h-14 text-lg transition-all duration-200 ${errors.phoneNumber ? 'border-red-400 focus:border-red-500' : 'focus:border-purple-500'}`}
                />
                {errors.phoneNumber && <p className="text-red-500 text-sm mt-2">{errors.phoneNumber}</p>}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-300">
                <Store className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('restaurantDetailsTitle')}
                </h2>
                <p className="text-gray-600 mt-2">{t('restaurantDetailsDescription')}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Label htmlFor="restaurant" className="text-lg font-medium">{t('restaurantNameLabel')}</Label>
                <Input
                  id="restaurant"
                  type="text"
                  placeholder={t('restaurantNamePlaceholder')}
                  value={formData.restaurantName}
                  onChange={(e) => setFormData({...formData, restaurantName: e.target.value})}
                  className={`mt-2 h-14 text-lg transition-all duration-200 ${errors.restaurantName ? 'border-red-400 focus:border-red-500' : 'focus:border-green-500'}`}
                />
                {errors.restaurantName && <p className="text-red-500 text-sm mt-2">{errors.restaurantName}</p>}
              </div>
              <div>
                <Label htmlFor="tables" className="text-lg font-medium">{t('totalTablesLabel')}</Label>
                <Input
                  id="tables"
                  type="number"
                  placeholder={t('totalTablesPlaceholder')}
                  value={formData.totalTables}
                  onChange={(e) => setFormData({...formData, totalTables: e.target.value})}
                  className={`mt-2 h-14 text-lg transition-all duration-200 ${errors.totalTables ? 'border-red-400 focus:border-red-500' : 'focus:border-green-500'}`}
                />
                {errors.totalTables && <p className="text-red-500 text-sm mt-2">{errors.totalTables}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-300">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {t('organizeTablesTitle')}
                </h2>
                <p className="text-gray-600 mt-2">{t('organizeTablesDescription')}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t('tableRegionsTitle')}</h3>
                <Dialog open={showRegionDialog} onOpenChange={setShowRegionDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-dashed border-blue-300 hover:border-blue-400 transition-all duration-200">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addRegionButton')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        {t('createTableRegionTitle')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label htmlFor="regionName">{t('regionNameLabel')}</Label>
                        <Input
                          id="regionName"
                          placeholder={t('regionNamePlaceholder')}
                          value={regionForm.name}
                          onChange={(e) => setRegionForm({...regionForm, name: e.target.value})}
                          className="mt-2"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startNum">{t('startTableLabel')}</Label>
                          <Input
                            id="startNum"
                            type="number"
                            placeholder="1"
                            value={regionForm.startNumber}
                            onChange={(e) => setRegionForm({...regionForm, startNumber: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="endNum">{t('endTableLabel')}</Label>
                          <Input
                            id="endNum"
                            type="number"
                            placeholder="10"
                            value={regionForm.endNumber}
                            onChange={(e) => setRegionForm({...regionForm, endNumber: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                      {regionError && <p className="text-red-500 text-sm pt-2">{regionError}</p>}
                      <Button onClick={addTableRegion} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mt-4">
                        {t('addRegionButton')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {tableRegions.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border animate-in fade-in-50 slide-in-from-left-4">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{region.name}</p>
                        <p className="text-sm text-gray-600">
                          {t('tablesRange', { start: region.startNumber, end: region.endNumber })} ({parseInt(region.endNumber) - parseInt(region.startNumber) + 1} {t('tablesCount')})
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTableRegion(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      {t('removeButton')}
                    </Button>
                  </div>
                ))}
                {tableRegions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{t('noRegionsAdded')}</p>
                    <p className="text-sm">{t('clickAddRegion')}</p>
                  </div>
                )}
              </div>
              {errors.tableRegions && <p className="text-red-500 text-sm">{errors.tableRegions}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                <Check className="w-12 h-12 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {t('perfectTitle')} 🎉
                </h2>
                <p className="text-xl text-gray-600 mt-2">{t('restaurantReady')}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-4">{t('setupSummaryTitle')}:</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('restaurantLabel')}:</span>
                  <span className="font-medium">{formData.restaurantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('phoneLabel')}:</span>
                  <span className="font-medium">{formData.phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('totalTablesLabel')}:</span>
                  <span className="font-medium">{formData.totalTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('regionsLabel')}:</span>
                  <span className="font-medium">{tableRegions.length}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${index <= currentStep ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`absolute top-6 left-12 w-24 h-0.5 transition-all duration-300 ${
                    index < currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 min-h-[500px]">
          {getStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-12 pt-8 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-8 py-3 text-lg disabled:opacity-50"
            >
              {t('previousButton')}
            </Button>
            <Button
              onClick={nextStep}
              disabled={isLoading}
              className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {isLoading ? t('processingButton') : (currentStep === steps.length - 1 ? t('completeSetupButton') : t('continueButton'))}
              {!isLoading && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccess} onOpenChange={setShowSuccess}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <AlertDialogTitle className="text-center text-2xl">
              {t('welcomeFamilyTitle')} 🎉
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-lg">
              {t('onboardingCompleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
              {t('getStartedButton')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
