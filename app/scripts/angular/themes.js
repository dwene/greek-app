App.config(function($mdThemingProvider) {

    $mdThemingProvider.definePalette('cyan', {
        '50': 'e0f7fa',
        '100': 'b2ebf2',
        '200': '80deea',
        '300': '4dd0e1',
        '400': '26c6da',
        '500': '00bcd4',
        '600': '00acc1',
        '700': '0097a7',
        '800': '00838f',
        '900': '006064',
        'A100': '84ffff',
        'A200': '18ffff',
        'A400': '00e5ff',
        'A700': '00b8d4',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('red', {
        '50': 'ffebee',
        '100': 'ffcdd2',
        '200': 'ef9a9a',
        '300': 'e57373',
        '400': 'ef5350',
        '500': 'f44336',
        '600': 'e53935',
        '700': 'd32f2f',
        '800': 'c62828',
        '900': 'b71c1c',
        'A100': 'ff8a80',
        'A200': 'ff5252',
        'A400': 'ff1744',
        'A700': 'd50000',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('purple', {
        '50': 'f3e5f5',
        '100': 'e1bee7',
        '200': 'ce93d8',
        '300': 'ba68c8',
        '400': 'ab47bc',
        '500': '9c27b0',
        '600': '8e24aa',
        '700': '7b1fa2',
        '800': '6a1b9a',
        '900': '4a148c',
        'A100': 'ea80fc',
        'A200': 'e040fb',
        'A400': 'd500f9',
        'A700': 'aa00ff',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('pink', {
        '50': 'fce4ec',
        '100': 'f8bbd0',
        '200': 'f48fb1',
        '300': 'f06292',
        '400': 'ec407a',
        '500': 'e91e63',
        '600': 'd81b60',
        '700': 'c2185b',
        '800': 'ad1457',
        '900': '880e4f',
        'A100': 'ff80ab',
        'A200': 'ff4081',
        'A400': 'f50057',
        'A700': 'c51162',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('green', {
        '50': '4caf50',
        '100': 'e8f5e9',
        '200': 'c8e6c9',
        '300': 'a5d6a7',
        '400': '66bb6a',
        '500': '4caf50',
        '600': '43a047',
        '700': '388e3c',
        '800': '2e7d32',
        '900': '1b5e20',
        'A100': 'b9f6ca',
        'A200': '69f0ae',
        'A400': '00e676',
        'A700': '00c853',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100', 'A200', 'A400', 'A700'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('orange', {
        '50': 'fbe9e7',
        '100': 'ffccbc',
        '200': 'ffab91',
        '300': 'ff8a65',
        '400': 'ff7043',
        '500': 'ff5722',
        '600': 'f4511e',
        '700': 'e64a19',
        '800': 'd84315',
        '900': 'bf360c',
        'A100': 'ff9e80',
        'A200': 'ff6e40',
        'A400': 'ff3d00',
        'A700': 'dd2c00',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100', 'A200'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('brown', {
        '50': 'efebe9',
        '100': 'd7ccc8',
        '200': 'bcaaa4',
        '300': 'a1887f',
        '400': '8d6e63',
        '500': '795548',
        '600': '6d4c41',
        '700': '5d4037',
        '800': '4e342e',
        '900': '3e2723',
        'A100': 'ff9e80',
        'A200': 'ff6e40',
        'A400': 'ff3d00',
        'A700': 'dd2c00',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.definePalette('gray', {
        '50': 'fafafa',
        '100': 'f5f5f5',
        '200': 'eeeeee',
        '300': 'e0e0e0',
        '400': 'bdbdbd',
        '500': '9e9e9e',
        '600': '757575',
        '700': '616161',
        '800': '424242',
        '900': '212121',
        'A100': '82b1ff',
        'A200': '448aff',
        'A400': '2979ff',
        'A700': '2962ff',
        'contrastDefaultColor': 'light',
        'contrastDarkColors': ['50', '100', '200', '300', '400', 'A100'],
        'contrastLightColors': undefined
    });
    $mdThemingProvider.theme('default').primaryPalette('cyan').accentPalette('pink');
    $mdThemingProvider.theme('cyan').primaryPalette('cyan').accentPalette('pink');
    $mdThemingProvider.theme('red').primaryPalette('red').accentPalette('gray');
    $mdThemingProvider.theme('purple').primaryPalette('purple').accentPalette('pink');
    $mdThemingProvider.theme('pink').primaryPalette('pink').accentPalette('gray');
    $mdThemingProvider.theme('orange').primaryPalette('orange').accentPalette('gray');
    $mdThemingProvider.theme('green').primaryPalette('green').accentPalette('pink');
    $mdThemingProvider.theme('brown').primaryPalette('brown').accentPalette('pink');
    $mdThemingProvider.theme('gray').primaryPalette('gray').accentPalette('pink');

});