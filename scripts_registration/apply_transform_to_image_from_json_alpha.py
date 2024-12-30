from __future__ import print_function

import SimpleITK as sitk
import sys
import os
import cv2
import matplotlib.pyplot as plt
import numpy as np
import json

from functions import    get_image_as_array_from_path,\
                         get_transform_from_parameters_bspline_fullFixedimage_translation, \
                         save_transformed_image_from_json_with_fixedImageSize_alpha,\
                         merge_images_to_create_png, load_json_from_path


#################241204
# configuration data:
# ['C:\\Users\\eugen\\PycharmProjects\\ImageRegistration_UI_implementation_NG_\\231214_imreg_python__read-json-settings_1\\imreg_python__read-json-settings.py']

# argv= <script> <destination_folder> <transform.json> <inputimag1 ... n>

print('configuration data:')
print(sys.argv)

destination_folder = os.path.join(os.getcwd(), 'result_transform_applied_to_additional_images') if (len(sys.argv) < 2) else sys.argv[1]
#argv[0] = <script>  argv[1] = <destination_folder>

path_json = 'transformations.json' if (len(sys.argv) < 3) else sys.argv[2]
#argv[2] = <transform.json>

path_image_2 = 'C:/Users/eugen/PycharmProjects/ImageRegistration_results/print_elemental_maps_NG6240/_s1_81_3_d02_rawdata_opencv2.jpg'
path_image_3 = 'C:/Users/eugen/PycharmProjects/ImageRegistration_results/print_elemental_maps_NG6240/_s1_25_0_d02_rawdata_opencv2_INVERTED.jpg'
path_image_4 = 'C:/Users/eugen/PycharmProjects/ImageRegistration_results/print_elemental_maps_NG6240/_s1_25_0_d02_rawdata_opencv2.jpg'

image_paths = [path_image_2, path_image_3, path_image_4] if (len(sys.argv) < 4) else sys.argv[3:]
#argv[3] = <inputimag1 ... n>


if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)

#################


#Greyscale images (otherwise plt returns color image)
plt.rcParams['image.interpolation'] = 'nearest'
plt.rcParams['image.cmap'] = 'gray'

# Fixed image
#path_image_1 = 'C:/Users/eugen/Desktop/2020_ICL/Pycharm_data/NG6420/N-6420-00-scaled_tomatch_d02_d10_hq.jpg' #ONLY VISIBLE IMAGE
scaling_coef = 1 #(for final res of full fixed image)
#fixed, fixed_array_scaled = get_fixed_image_from_path(path_image_1, scaling_coef) #return fixed_sitk, fixed_array_scaled


# slices_of_moving_image = list of images-as-arrays (these constitute the movingimage)
slices_of_moving_image_dict = {key:value for (key, value) in enumerate(image_paths)}
print("slices_of_moving_image_dict")
print(slices_of_moving_image_dict)

#slices_of_moving_image_dict = dict(map(lambda item: (item[0], get_fixed_image_from_path(item[1], scaling_coef)[1]), slices_of_moving_image_dict.items()))  # images-as-arrays
slices_of_moving_image_dict = dict(map(lambda item: (item[0], get_image_as_array_from_path(item[1])), slices_of_moving_image_dict.items()))  # images-as-arrays
print('again')
print(slices_of_moving_image_dict)


# read data from json
#path_json = 'mov_img_0_transformations__test_1.json'
data_from_json = load_json_from_path(path_json)

best_tr_all = [[data_from_json['transformation_obtained_s4'], data_from_json['transformation_obtained_s3'], data_from_json['fixed_parameters'], data_from_json['loc_at_crop']]]

transforms = list(get_transform_from_parameters_bspline_fullFixedimage_translation(*tr) for tr in best_tr_all)

target_fixed_image_shape = data_from_json['target_fixed_image_size_scaled___y_x']
print("target_fixed_image_shape")
print(target_fixed_image_shape)

transform = transforms

ims_to_merge = save_transformed_image_from_json_with_fixedImageSize_alpha(target_fixed_image_shape, transform, slices_of_moving_image_dict)

png_images = merge_images_to_create_png(ims_to_merge)
print('png_images = ' + str(png_images))

for key, image in png_images.items():
    plt.imsave(destination_folder + '/Final_transformed_image_' + key + '.png', image)
    #plt.imsave(destination_folder + '/results/' + config['datacube_no'] + 'Final_transformed_image_' + key + '.png', image)
    #plt.imsave('Final_transformed_image_' + key + '.png', image)
